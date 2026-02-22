const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking Challenge model fields...");
    // We can't easily inspect types at runtime, but we can try to create a dummy object 
    // or just see if the client throws when accessing the field in a query.

    try {
        // Attempt to fetch one challenge and see if it has the field
        const challenge = await prisma.challenge.findFirst();
        if (challenge) {
            console.log('Challenge found:', challenge);
            console.log('Has checkInSource:', 'checkInSource' in challenge);
            console.log('checkInSource value:', challenge.checkInSource);
        } else {
            console.log('No challenges found, but query worked.');
        }
    } catch (e) {
        console.error('Error querying challenge:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
