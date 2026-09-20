// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * SanitovaCredits — tokenized WASH (Water, Sanitation, Hygiene) impact credits.
 *
 * Each credit class is an ERC-1155 token ID. A credit encodes, on-chain:
 *   - the real-world impact it represents (households served, latrines built, ...)
 *   - the exact location (lat/lng) so it can be pinned on a map
 *   - a verification hash (sha256 of the inspection report + NGO attestation)
 *
 * The wedge: a corporate ESG officer can buy verified WASH credits and retire
 * them for reporting in two minutes, with proof that is on-chain and auditable,
 * instead of trusting an NGO PDF through a six-week manual cycle.
 */
contract SanitovaCredits is ERC1155, Ownable2Step {
    struct CreditMetadata {
        string name;
        string location; // human readable, e.g. "Kogi State, Nigeria"
        uint24 lat; // latitude * 1e4, e.g. 7.8000 -> 78000
        uint24 lng; // longitude * 1e4, e.g. 6.7400 -> 67400
        string impactUnit; // "households served", "latrines built", ...
        uint256 pricePerUnit; // OKB, wei
        bytes32 verificationHash; // sha256(inspection report + attestation)
        bool active;
    }

    // credit id => metadata
    mapping(uint256 => CreditMetadata) public creditMetadatas;
    mapping(uint256 => uint256) public creditSupply; // current non-retired supply per id
    uint256 public nextCreditId;
    uint256 public totalCreditsIssued;
    uint256 public totalCreditsRetired;
    uint256 public treasuryBalance; // OKB collected from public purchases

    event CreditMetadataSet(
        uint256 indexed id,
        string name,
        string location,
        uint24 lat,
        uint24 lng,
        string impactUnit,
        uint256 pricePerUnit,
        bytes32 verificationHash
    );
    event CreditMinted(uint256 indexed id, address indexed to, uint256 amount);
    event CreditRetired(uint256 indexed id, address indexed by, uint256 amount);
    event CreditPurchased(uint256 indexed id, address indexed buyer, uint256 amount, uint256 priceOKB);
    event CreditDeactivated(uint256 indexed id);

    string constant B64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    constructor()
        ERC1155("data:sanitova/credits.json")
        Ownable(msg.sender)
    {}

    /// @notice Register a new credit class (owner / verification authority).
    function setCreditMetadata(
        string calldata name,
        string calldata location,
        uint24 lat,
        uint24 lng,
        string calldata impactUnit,
        uint256 pricePerUnit,
        bytes32 verificationHash,
        uint256 initialSupply
    ) external onlyOwner returns (uint256 id) {
        id = nextCreditId++;
        creditMetadatas[id] = CreditMetadata({
            name: name,
            location: location,
            lat: lat,
            lng: lng,
            impactUnit: impactUnit,
            pricePerUnit: pricePerUnit,
            verificationHash: verificationHash,
            active: true
        });
        emit CreditMetadataSet(id, name, location, lat, lng, impactUnit, pricePerUnit, verificationHash);

        if (initialSupply > 0) {
            _mint(msg.sender, id, initialSupply, "");
            creditSupply[id] += initialSupply;
            totalCreditsIssued += initialSupply;
            emit CreditMinted(id, msg.sender, initialSupply);
        }
    }

    /// @notice Mint additional credits of an existing class to `to` (owner).
    function mintCredit(uint256 id, address to, uint256 amount)
        external
        onlyOwner
    {
        require(creditMetadatas[id].active, "SAN: credit inactive");
        _mint(to, id, amount, "");
        creditSupply[id] += amount;
        totalCreditsIssued += amount;
        emit CreditMinted(id, to, amount);
    }

    /// @notice Retire (burn) credits for an ESG report. Callable by the holder.
    /// Emits CreditRetired so the retirement is permanently on-chain.
    function retireCredit(uint256 id, uint256 amount) external {
        require(creditMetadatas[id].active, "SAN: credit inactive");
        require(balanceOf(msg.sender, id) >= amount, "SAN: insufficient balance");
        _burn(msg.sender, id, amount);
        creditSupply[id] -= amount;
        totalCreditsRetired += amount;
        emit CreditRetired(id, msg.sender, amount);
    }

    /// @notice Public purchase: pay OKB, receive credits from the issuer's
    /// verified allocation. Credits are scarce by design — the verification
    /// authority mints a fixed supply per class (when a real-world impact is
    /// certified); buyers acquire it here, they cannot inflate it.
    function buyCredit(uint256 id, uint256 amount) external payable {
        CreditMetadata storage m = creditMetadatas[id];
        require(m.active, "SAN: credit inactive");
        require(amount > 0, "SAN: zero amount");
        uint256 price = m.pricePerUnit * amount;
        require(msg.value == price, "SAN: wrong amount");
        require(balanceOf(owner(), id) >= amount, "SAN: allocation exhausted");
        // Issuer inventory -> buyer. The verification authority (owner) approves
        // the registry once at onboarding (setApprovalForAll) so it can sell.
        this.safeTransferFrom(owner(), msg.sender, id, amount, "");
        treasuryBalance += price;
        emit CreditPurchased(id, msg.sender, amount, price);
    }

    /// @notice Owner withdraws collected purchase proceeds (treasury).
    function withdrawOKB(address to, uint256 amount) external onlyOwner {
        require(treasuryBalance >= amount, "SAN: exceeds treasury");
        treasuryBalance -= amount;
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "SAN: transfer failed");
    }

    /// @notice Owner can retire on behalf of an account (e.g. a corporate treasury).
    function retireCreditBy(address holder, uint256 id, uint256 amount)
        external
        onlyOwner
    {
        require(creditMetadatas[id].active, "SAN: credit inactive");
        require(balanceOf(holder, id) >= amount, "SAN: insufficient balance");
        _burn(holder, id, amount);
        creditSupply[id] -= amount;
        totalCreditsRetired += amount;
        emit CreditRetired(id, holder, amount);
    }

    function deactivateCredit(uint256 id) external onlyOwner {
        require(creditMetadatas[id].active, "SAN: already inactive");
        creditMetadatas[id].active = false;
        emit CreditDeactivated(id);
    }

    function getCreditMetadata(uint256 id)
        external
        view
        returns (
            string memory name,
            string memory location,
            uint24 lat,
            uint24 lng,
            string memory impactUnit,
            uint256 pricePerUnit,
            bytes32 verificationHash,
            bool active
        )
    {
        CreditMetadata storage m = creditMetadatas[id];
        return (m.name, m.location, m.lat, m.lng, m.impactUnit, m.pricePerUnit, m.verificationHash, m.active);
    }

    function totalSupplyCredit(uint256 id) external view returns (uint256) {
        return creditSupply[id];
    }

    /// @notice Self-contained ERC-1155 metadata: a data: URI holding the credit
    /// JSON, so no external IPFS/HTTP dependency. (On-chain getCreditMetadata is
    /// the source of truth; this is the client-readable wrapper.)
    function uri(uint256 id) public view override returns (string memory) {
        CreditMetadata storage m = creditMetadatas[id];
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                _b64(
                    abi.encodePacked(
                        '{"name":"', m.name,
                        '","location":"', m.location,
                        '","lat1e4":', _toStr(uint256(m.lat)),
                        ',"lng1e4":', _toStr(uint256(m.lng)),
                        ',"impactUnit":"', m.impactUnit,
                        '","pricePerUnitWei":"', _toStr(m.pricePerUnit),
                        '","verificationHash":"', _toHex(m.verificationHash),
                        '"}'
                    )
                )
            )
        );
    }

    function _toStr(uint256 v) private pure returns (string memory) {
        if (v == 0) return "0";
        uint256 n = v;
        uint256 len;
        while (n != 0) { len++; n /= 10; }
        bytes memory b = new bytes(len);
        while (v != 0) { b[len - 1] = bytes1(uint8(48 + (v % 10))); len--; v /= 10; }
        return string(b);
    }

    function _toHex(bytes32 x) private pure returns (string memory) {
        bytes memory b = new bytes(66);
        b[0] = "0"; b[1] = "x";
        uint256 xv = uint256(x);
        for (uint256 i = 0; i < 32; i++) {
            b[2 + i * 2] = _hexNibble(bytes1(uint8(xv >> (248 - i * 8)) >> 4));
            b[3 + i * 2] = _hexNibble(bytes1(uint8(xv >> (248 - i * 8)) & 0x0f));
        }
        return string(b);
    }

    function _hexNibble(bytes1 n) private pure returns (bytes1) {
        uint8 v = uint8(n);
        return bytes1(v < 10 ? (48 + v) : (55 + v));
    }

    function _b64(bytes memory data) private pure returns (string memory) {
        if (data.length == 0) return "";
        uint256 paddedLen = (data.length + 2) / 3 * 4;
        bytes memory b = new bytes(paddedLen);
        bytes memory alpha = bytes(B64_ALPHABET);
        for (uint256 i = 0; i < paddedLen; i += 4) {
            uint256 triple = 0;
            for (uint256 j = 0; j < 3; j++) {
                uint256 bytePos = i / 4 * 3 + j;
                triple = triple << 8;
                if (bytePos < data.length) triple |= uint8(data[bytePos]);
            }
            b[i]     = alpha[triple >> 18 & 0x3F];
            b[i + 1] = alpha[triple >> 12 & 0x3F];
            b[i + 2] = alpha[triple >> 6 & 0x3F];
            b[i + 3] = alpha[triple & 0x3F];
        }
        // restore canonical padding
        uint256 rem = data.length % 3;
        if (rem == 1) { b[paddedLen - 1] = "="; b[paddedLen - 2] = "="; }
        else if (rem == 2) { b[paddedLen - 1] = "="; }
        return string(b);
    }

    // ERC-1155 + Ownable2Step interface resolution
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
