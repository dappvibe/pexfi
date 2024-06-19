const {expect} = require("chai");

describe("Market", function() {
    it("Deployment does nothing", async function() {
        const [owner] = await ethers.getSigners();
        const market = await ethers.deployContract("Market");
    });
});
