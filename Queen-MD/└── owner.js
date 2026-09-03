// ╔══════════════════════════════════════════════╗
// ║              👑 QUEEN MD                    ║
// ║              OWNER CONFIG                   ║
// ╚══════════════════════════════════════════════╝

const owners = {
    owner: {
        name: "Miss Queen",
        number: "2348071569915",
        role: "Owner"
    },

    founder: {
        name: "Miss Queen",
        number: "2348071569915",
        role: "Founder"
    },

    developer: {
        name: "Queen MD Developer",
        number: "2348122029123",
        role: "Developer"
    },

    creator: {
        name: "Queen MD Creator",
        number: "239166265317",
        role: "Creator"
    }
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👑 ALL OWNER NUMBERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ownerNumbers = [
    owners.owner.number,
    owners.founder.number,
    owners.developer.number,
    owners.creator.number
];


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔐 CHECK OWNER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function isOwner(number) {
    if (!number) return false;

    const cleanNumber = String(number)
        .replace(/[^0-9]/g, "");

    return ownerNumbers.includes(cleanNumber);
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📋 OWNER INFORMATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getOwnerInfo() {
    return owners;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📱 OWNER CONTACTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getOwnerNumbers() {
    return ownerNumbers;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📤 EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

module.exports = {
    owners,
    ownerNumbers,
    isOwner,
    getOwnerInfo,
    getOwnerNumbers
};
