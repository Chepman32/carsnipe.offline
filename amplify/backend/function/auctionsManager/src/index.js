const { AwsAppSyncClient } = require("aws-appsync");
const gql = require("graphql-tag");
const fetch = require("node-fetch"); // Needed for AppSync client in Node
global.fetch = fetch;

// Example GraphQL queries/mutations (adjust the import paths or structure as needed):
const LIST_USERS = gql`
  query ListUsers {
    listUsers {
      items {
        id
        nickname
        email
      }
    }
  }
`;

const LIST_CARS = gql`
  query ListCars {
    listCars {
      items {
        id
        make
        model
        year
        price
      }
    }
  }
`;

const CREATE_AUCTION = gql`
  mutation CreateAuction($input: CreateAuctionInput!) {
    createAuction(input: $input) {
      id
      make
      model
      year
      minBid
      buy
      endTime
      status
      player
    }
  }
`;

const UPDATE_AUCTION_USERS = gql`
  mutation UpdateAuction($input: UpdateAuctionInput!) {
    updateAuction(input: $input) {
      id
      user {
        id
      }
    }
  }
`;

const DELETE_AUCTION = gql`
  mutation DeleteAuction($input: DeleteAuctionInput!) {
    deleteAuction(input: $input) {
      id
    }
  }
`;

const LIST_AUCTIONS = gql`
  query ListAuctions {
    listAuctions {
      items {
        id
        createdAt
        status
        buy
      }
    }
  }
`;

const UPDATE_CAR_IN_AUCTION = gql`
  mutation UpdateCar($input: UpdateCarInput!) {
    updateCar(input: $input) {
      id
      inAuction
    }
  }
`;

// Adjust these values for your environment
const appSyncClient = new AwsAppSyncClient({
  url: process.env.API_YOURAPP_GRAPHQLAPIENDPOINTOUTPUT,
  region: process.env.REGION,
  auth: {
    type: "API_KEY",
    apiKey: process.env.API_YOURAPP_GRAPHQLAPIKEYOUTPUT,
  },
  disableOffline: true,
});

/**
 * 1) Runs every hour.
 * 2) Creates a new auction with a random user as creator and random car as item.
 * 3) Sets minBid as either 5%, 15%, 25%, 40%, or 60% of the car’s price.
 * 4) Sets the buy out price to the car’s price.
 * 5) Marks the car as being in an auction.
 * 6) Removes any auction older than 24 hours if it wasn’t bought.
 */
exports.handler = async () => {
  try {
    // 1. Pick a random user
    const usersResult = await appSyncClient.query({ query: LIST_USERS, fetchPolicy: "no-cache" });
    const users = usersResult.data?.listUsers?.items || [];
    if (users.length === 0) return { statusCode: 200, body: JSON.stringify({ message: "No users found" }) };
    const randomUser = users[Math.floor(Math.random() * users.length)];

    // 2. Pick a random car
    const carsResult = await appSyncClient.query({ query: LIST_CARS, fetchPolicy: "no-cache" });
    const cars = carsResult.data?.listCars?.items || [];
    if (cars.length === 0) return { statusCode: 200, body: JSON.stringify({ message: "No cars found" }) };
    const randomCar = cars[Math.floor(Math.random() * cars.length)];

    // 3. Determine random minBid as a percentage of the car’s price
    const possiblePercentages = [0.05, 0.15, 0.25, 0.4, 0.6];
    const randomPercentage = possiblePercentages[Math.floor(Math.random() * possiblePercentages.length)];
    const minBidValue = Math.floor(randomCar.price * randomPercentage);

    // 4. Set buy out price to the car’s price
    const buyOutPrice = randomCar.price;

    // 5. Calculate endTime (auction active for 24 hours from now)
    //    For this example, store it as ISO string. Alternatively, store as a timestamp if desired.
    const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // 6. Create the new Auction
    const auctionInput = {
      make: randomCar.make,
      model: randomCar.model,
      year: randomCar.year,
      carId: randomCar.id,
      currentBid: 0,
      endTime,
      status: "Active",
      lastBidPlayer: "",
      player: randomUser.nickname,
      buy: buyOutPrice,
      minBid: minBidValue,
      type: randomCar.type || "N/A", // If type is not mandatory, handle accordingly
    };

    const createAuctionResponse = await appSyncClient.mutate({
      mutation: CREATE_AUCTION,
      variables: { input: auctionInput },
      fetchPolicy: "no-cache",
    });

    const createdAuction = createAuctionResponse.data?.createAuction;
    if (!createdAuction) {
      return { statusCode: 500, body: JSON.stringify({ message: "Auction creation failed" }) };
    }

    // 7. Link randomUser to newly created auction via manyToMany
    await appSyncClient.mutate({
      mutation: UPDATE_AUCTION_USERS,
      variables: {
        input: {
          id: createdAuction.id,
          user: [randomUser.id], // manyToMany expects array of user ids
        },
      },
      fetchPolicy: "no-cache",
    });

    // 8. Mark car as inAuction = true
    await appSyncClient.mutate({
      mutation: UPDATE_CAR_IN_AUCTION,
      variables: {
        input: {
          id: randomCar.id,
          inAuction: true,
        },
      },
      fetchPolicy: "no-cache",
    });

    // 9. Clean up old auctions that are more than 24h old and not bought
    //    (Assumes 'status' stays "Active" if it wasn’t bought. Adjust as needed.)
    const allAuctionsResult = await appSyncClient.query({ query: LIST_AUCTIONS, fetchPolicy: "no-cache" });
    const allAuctions = allAuctionsResult.data?.listAuctions?.items || [];
    const now = new Date();

    for (const auction of allAuctions) {
      const createdTime = new Date(auction.createdAt);
      // If older than 24h, still "Active", remove it
      if (auction.status === "Active" && now - createdTime > 24 * 60 * 60 * 1000) {
        await appSyncClient.mutate({
          mutation: DELETE_AUCTION,
          variables: { input: { id: auction.id } },
          fetchPolicy: "no-cache",
        });
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Auction created successfully and old auctions cleaned up",
        createdAuction,
        randomUser,
        randomCar,
        minBidValue,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error creating auction or cleaning up", error: err.message }),
    };
  }
};