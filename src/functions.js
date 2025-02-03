import { generateClient } from "aws-amplify/api";
import * as queries from './graphql/queries'
import * as mutations from './graphql/mutations'
import SwitchSound from "./assets/audio/light-switch.mp3"
import OpeningSound from "./assets/audio/opening.MP3"
import ClosingSound from "./assets/audio/closing.MP3"
import avatar1 from "./assets/images/avatars/avatar1.jpg"
import avatar2 from "./assets/images/avatars/avatar2.jpg"
import avatar3 from "./assets/images/avatars/avatar3.jpeg"
import avatar4 from "./assets/images/avatars/avatar4.jpeg"
import avatar5 from "./assets/images/avatars/avatar5.jpeg"
import avatar6 from "./assets/images/avatars/avatar6.jpeg"
import avatar7 from "./assets/images/avatars/avatar7.png"
import avatar8 from "./assets/images/avatars/avatar8.jpeg"
import avatar9 from "./assets/images/avatars/avatar9.png"
import avatar10 from "./assets/images/avatars/avatar10.png"
import avatar11 from "./assets/images/avatars/avatar11.jpeg"
import avatar12 from "./assets/images/avatars/avatar12.jpeg"
import avatar13 from "./assets/images/avatars/avatar13.png"
import avatar14 from "./assets/images/avatars/avatar14.png"
import avatar15 from "./assets/images/avatars/avatar15.png"
import avatar16 from "./assets/images/avatars/avatar16.png"

import { message } from "antd";

const client = generateClient();

export const fetchUserCarsRequest = async (id) => {
  try {
    const userData = await client.graphql({
      query: `
        query GetUser($id: ID!) {
          getUser(id: $id) {
            cars {
              items {
                car {
                  id
                  make
                  model
                  year
                  type
                  price
                }
              }
            }
          }
        }
      `,
      variables: {
        id
      },
    });
    return userData.data.getUser.cars.items
  } catch (error) {
    console.error("Error fetching user's cars:", error);
  }
}

export const fetchAuctionCreator = async (auctionId) => {
  try {
    const auctionUserData = await fetchAuctionUser(auctionId);
    
    if (!auctionUserData) {
      // Auction user not found
      return null;
    }
    
    return auctionUserData;
  } catch (error) {
    console.error("Error fetching auction creator:", error);
    throw error;
  }
}

export const fetchUserInfoById = async (userId) => {
  try {
    const userData = await client.graphql({
      query: queries.getUser,
      variables: {
        id: userId
      },
    });

    return userData.data.getUser;
  } catch (error) {
    console.error("Error fetching user information:", error);
    throw error;
  }
}

export const getCarTypeColor = (carType) => {
  switch (carType) {
    case "regular":
      return "#32a852"
    case "rare":
      return "#397aab"
      case "legendary":
      return "#d4ca0f"
      case "epic":
      return "#4d1ac4"
    default:
      return "#32a852"
  }
}
  
export function calculateTimeDifference(targetTime) {
  const targetDateTime = new Date(targetTime);
  const currentTime = new Date();
  const timeDifferenceInSeconds = Math.floor((targetDateTime - currentTime) / 1000);

  if (timeDifferenceInSeconds <= 0) {
    return "Finished";
  } else if (timeDifferenceInSeconds < 60) {
    return "finishing";
  } else if (timeDifferenceInSeconds < 3600) {
    const minutes = Math.floor(timeDifferenceInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    const hours = Math.floor(timeDifferenceInSeconds / 3600);
    const remainingMinutes = Math.floor((timeDifferenceInSeconds % 3600) / 60);
    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  }
}

export const createNewUserCar = async (userId, carId) => {
  try {
    await client.graphql({
      query: mutations.createUserCar,
      variables: { input: { userId, carId } },
    });
    
    const user = await client.graphql({
      query: mutations.updateUser,
      variables: {
        input: {
          id: userId,
          totalCarsOwned: { increment: 1 }
        }
      }
    });
    return user;
  } catch (error) {
    console.error("Error associating car with user:", error);
  }
};

export async function getUserCar(userId, carId) {
  const userCarData = await client.graphql({
    query: queries.listUserCars,
    variables: {
      filter: {
        userId: { eq: userId },
        carId: { eq: carId }
      }
    },
  });

  const cars = userCarData?.data?.listUserCars?.items;
  
  if (cars && cars.length > 0) {
    return cars[0]; // Return the first matching car object
  } else {
    throw new Error("Car not found for the specified user and car ID");
  }
}

export const deleteUserCar = async (carId, userId) => {
  try {
    await client.graphql({
      query: mutations.deleteUserCar,
      variables: { input: { id: carId } },
    });

    await client.graphql({
      query: mutations.updateUser,
      variables: {
        input: {
          id: userId,
          totalCarsOwned: { decrement: 1 }
        }
      }
    });
  } catch (error) {
    console.error("Error deleting user car:", error);
  }
};

export const createNewAuctionUser = async (userId, auctionId) => {
  try {
    const result = await client.graphql({
      query: mutations.createAuctionUser,
      variables: {
        input: {
          userId,
          auctionId,
        },
      },
    });
    return result.data.createAuctionUser; // Return the created auction user data
  } catch (error) {
    console.error('Error creating auction user:', error);
    throw error; // Handle or propagate the error as needed
  }
};

export const fetchAuctionUser = async (auctionId) => {
  try {
    const auctionUserData = await client.graphql({
      query: queries.listAuctionUsers,
      variables: {
        filter: {
          auctionId: { eq: auctionId }
        }
      }
    });

    const auctionUser = auctionUserData.data.listAuctionUsers.items[0];

    if (!auctionUser) {
      // Auction user not found
      return null;
    }

    const userData = await client.graphql({
      query: queries.getUser,
      variables: {
        id: auctionUser.userId  
      }
    });

    const user = userData.data.getUser;
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


export const increaseAuctionUserMoney = async (auctionUserId) => {

  try {

    // Get current user money
    const userResult = await client.graphql({
      query: queries.getUser,  
      variables: {
        id: auctionUserId
      }
    });
    
    const currentMoney = userResult.data.getUser.money;

    // Calculate new money
    const newMoney = currentMoney + 2000;

    // Update user with new money
    await client.graphql({
      query: mutations.updateUser,
      variables: {
        input: {
          id: auctionUserId,
          money: newMoney
        }
      }
    });

    console.log("Increased auction user money by 2000!");

  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserCreatedAuction(auctionId) {
  try {
    const auctionUserData = await client.graphql({
      query: queries.getAuctionUser,
      variables: {
        id: auctionId
      }
    });

    const auctionUser = auctionUserData.data.getAuctionUser;

    if (!auctionUser) {
      // Auction user not found
      return null;
    }

    return auctionUser.userId;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const addUserToAuction = async (userId, auctionId) => {
  try {
    await client.graphql({
      query: mutations.createAuctionUser,
      variables: {
        input: {
          userId: userId,
          auctionId: auctionId
        }
      }
    });
  } catch (error) {
    console.error('Error adding user to auction:', error);
    // Handle error or notify the user
  }
};

export const fetchUserBiddedList = async (userId) => {
  try {
    const userData = await client.graphql({
      query: queries.getUser,
      variables: {
        id: userId,
      },
    });

    const biddedAuctions = userData.data.getUser.bidded;
    return biddedAuctions;
  } catch (error) {
    console.error("Error fetching user's bidded auctions:", error);
    return [];
  }
};

export const fetchUserData = async (userId) => {
  try {
    const userData = await client.graphql({
      query: queries.getUser,
      variables: {
        id: userId,
      },
    });

    return userData.data.getUser || null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export const fetchUserAchievementsList = async (userId) => {
  try {
    const userData = await client.graphql({
      query: queries.getUser,
      variables: {
        id: userId,
      },
    });

    return userData.data.getUser.achievements || [];
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    return [];
  }
};

export async function getCarPriceByIdFromUserCar(userId, carId) {
  try {
    const userData = await client.graphql({
      query: `
        query GetUserCar($userId: ID!, $carId: ID!) {
          getUser(id: $userId) {
            cars(filter: {carId: {eq: $carId}}) {
              items {
                car {
                  price
                }
              }
            }
          }
        }
      `,
      variables: {
        userId,
        carId
      },
    });

    const carData = userData.data.getUser.cars.items[0];
    if (carData && carData.car) {
      return carData.car.price;
    } else {
      throw new Error("Car not found in user's cars");
    }
  } catch (error) {
    console.error("Error fetching car price:", error);
    throw error;
  }
}

export const playSwitchSound = () => {
  const audio = new Audio(SwitchSound);
    audio.play();
}

export const playOpeningSound = () => {
  const audio = new Audio(OpeningSound);
    audio.play();
}

export const playClosingSound = () => {
  const audio = new Audio(ClosingSound);
    audio.play();
}

export const getCarsPerRow = () => {
  const width = window.innerWidth;
  if (width < 512) return 1;
  if (width < 768) return 2;
  if (width < 900) return 2;
  if (width < 1200) return 3;
  if (width < 1600) return 4;
  return 5;
};

export const selectAvatar = (avatar) => {
  switch (avatar) {
    case "avatar1":
      return avatar1;
    case "avatar2":
      return avatar2;
    case "avatar3":
      return avatar3;
    case "avatar4":
      return avatar4;
    case "avatar5":
      return avatar5;
      case "avatar6":
      return avatar6;
      case "avatar7":
        return avatar7
      case "avatar8":
        return avatar8
      case "avatar9":
        return avatar9
      case "avatar10":
        return avatar10
      case "avatar11":
        return avatar11
      case "avatar12":
        return avatar12
      case "avatar13":
        return avatar13
      case "avatar14":
        return avatar14
      case "avatar15":
        return avatar15
      case "avatar16":
        return avatar16
    default:
      return avatar1;
  }
}

export function extractNameFromEmail(email) {
  return email.split('@')[0];
}

export const getImageSource = (make, model) => {
  const imageName = `${make} ${model}.png`;
  return require(`./assets/images/cars/${imageName}`);
};

export const getAchievementImageSource = (title) => {
  const imageName = `${title}.png`;
  return require(`./assets/images/achievements/${imageName}`);
};

export async function checkAndUpdateAchievements(user, dispatch, getState) {
  const info = await fetchUserData(user.id);
  try {
    const state = getState();
    const userState = state.user;
    const userAchievements = userState.achievements || [];
    const userCars = userState.cars || [];
    const userBidded = userState.biddedAuctions || [];
    const userSold = info.sold || [];
    const userNickname = userState.nickname;

    const currentAchievements = userAchievements.map(a => a.name);
    const newAchievements = [];

    const addAchievement = (name) => {
      if (!currentAchievements.includes(name)) {
        const achievement = { name, date: new Date().toISOString() };
        newAchievements.push(achievement);
        dispatch(addAchievement(achievement));
        
        // Display achievement unlock message with custom styling
        message.success({
          content: `🏆 Achievement Unlocked: ${name}!`,
          className: 'achievement-message',
          duration: 4,
          style: {
            marginTop: '20vh',
            padding: '10px 20px',
            borderRadius: '8px',
            background: '#f6ffed',
            border: '1px solid #b7eb8f',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }
        });
      }
    };

    console.log("userBidded", userBidded.length);

    // Basic achievements
    if (userBidded.length === 0) addAchievement("First One");
    if (userCars.length >= 3) addAchievement("Starter Pack");
    if (userCars.length >= 5) addAchievement("New Collector");
    if (userSold.length >= 1) addAchievement("Quick Sale");
    if (userCars.length >= 10) addAchievement("Mid-Range Collector");
    if (userCars.length >= 15) addAchievement("Collector's Dream");
    if (userCars.length >= 20) addAchievement("Collector King");
    if (userCars.length >= 25) addAchievement("Elite Collector");
    if (userCars.length >= 30) addAchievement("Ultimate Collector");
    if (userCars.length >= 50) addAchievement("Grand Collector");
    if (userCars.length >= 100) addAchievement("Insane Collector");
    if (userCars.length >= 200) addAchievement("Legendary Collector");

    // Auction participation achievements
    const uniqueAuctions = new Set(userBidded.map(bid => bid.auctionId));
    if (uniqueAuctions.size >= 1) addAchievement("Rookie");
    if (uniqueAuctions.size >= 20) addAchievement("Auction Veteran");
    if (uniqueAuctions.size >= 25) addAchievement("Intermediate Bidder");
    if (uniqueAuctions.size >= 50) addAchievement("Frequent Bidder");
    if (uniqueAuctions.size >= 100) addAchievement("Auction Champ");

    // Money related achievements
    const totalSpent = userBidded.reduce((sum, bid) => sum + bid.bidValue, 0);
    if (totalSpent > 100000) addAchievement("High Roller");
    if (totalSpent > 200000) addAchievement("High Stakes");
    if (totalSpent > 500000) addAchievement("Big Spender");
    if (totalSpent > 500000) addAchievement("Whale Bidder");

    // First bid achievements
    const uniqueAuctionsFirstBid = new Set(
      userBidded.filter(bid => {
        const auction = userBidded.find(a => a.auctionId === bid.auctionId);
        return auction && auction.isFirstBid;
      }).map(bid => bid.auctionId)
    ).size;
    if (uniqueAuctionsFirstBid >= 5) addAchievement("Early Bird");

    // Selling achievements
    if (userSold.length > 0) {
      const profitSales = userSold.filter(sale => sale.profit > 0);
      if (profitSales.length > 0) addAchievement("First Profit");
      if (profitSales.length >= 5) addAchievement("Profit Dealer");
      if (profitSales.length >= 10) addAchievement("Silver Dealer");
      if (profitSales.length >= 15) addAchievement("Gold Dealer");
      if (profitSales.length >= 50) addAchievement("Pro Seller");
      if (profitSales.length >= 100) addAchievement("Market Dominator");

      const totalProfit = profitSales.reduce((sum, sale) => sum + sale.profit, 0);
      if (totalProfit >= 50000) addAchievement("Savvy Investor");
      if (totalProfit >= 100000) addAchievement("Money Maker");
      if (totalProfit >= 1000000) addAchievement("Wealthy Trader");
    }

    // Sync with backend if there are new achievements
    if (newAchievements.length > 0) {
      const updatedAchievements = [...userAchievements, ...newAchievements];
      await client.graphql({
        query: mutations.updateUser,
        variables: {
          input: {
            id: user.id,
            achievements: updatedAchievements.map(ach => ({
              name: ach.name,
              date: ach.date,
            })),
          },
        },
      });
    }
  } catch (error) {
    console.error("Error updating achievements:", error);
  }
}