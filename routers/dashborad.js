const express = require("express");
const router = express.Router();
const registration = require("../model/registration");

const stake2 = require("../model/stake");
const moment = require("moment-timezone");
const WithdrawalModel = require("../model/withdraw");
const { verifyToken } = require("../Middleware/jwtToken");
const { compareSync } = require("bcrypt");
const UserIncome = require("../model/UserIncome");
const { default: axios } = require("axios");
const PackageBuy = require("../model/PackageBuy");
const newuserplace = require("../model/newuserplace");
const AdminCred = require("../model/AdminCred");
const m28buy = require("../model/m28buy");
const m28income = require("../model/m28income");
const globaldownline = require("../model/globaldownlineincome");
const globalupline = require("../model/globaluplineincome");
const sponsorincome = require("../model/sponsorincome");
const crypto = require("crypto");
const m28SponsorIncome = require("../model/m28sponsorincome");
const levelupgrade = require("../model/levelupgrade");
const upgradeincome = require("../model/upgradeincome");
// const registration = require("../model/registration");
// const registration = require("../model/registration");
// const registration = require("../model/registration");
// const registration = require("../model/registration");

router.get("/dashborad", async (req, res) => {
  try {
    const startOfToday = moment.tz("Asia/Kolkata").startOf("day").toDate();
    const endOfToday = moment.tz("Asia/Kolkata").endOf("day").toDate();

    console.log(startOfToday, ":::", endOfToday);

    const totaluser = await registration.find({}).countDocuments();
    const activeUser = await registration.find({ stake_amount: { $gt: 0 } }).countDocuments();
    const inactiveUser = await registration.find({ stake_amount: 0 }).countDocuments();

    const allTimeTotals = await stake2.aggregate([
      {
        $group: {
          _id: "$plan",
          totalAmount: { $sum: "$amount" },
          totalToken: { $sum: "$token" },
        }
      }
    ]);

    const todayTotals = await stake2.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfToday,
            $lt: endOfToday,
          },
        },
      },
      {
        $group: {
          _id: "$plan",
          totalAmount: { $sum: "$amount" },
          totalToken: { $sum: "$token" },
        },
      },
    ]);

    const formatTotals = (totals) => {
      const result = {
        DSC: { totalAmount: 0, totalToken: 0 },
        USDT: { totalAmount: 0, totalToken: 0 },
        stDSC: { totalAmount: 0, totalToken: 0 },
      };

      totals.forEach(({ _id: plan, totalAmount, totalToken }) => {
        if (result[plan]) {
          result[plan].totalAmount = totalAmount;
          result[plan].totalToken = totalToken;
        }
      });

      return result;
    };

    const allTimeFormatted = formatTotals(allTimeTotals);
    const todayFormatted = formatTotals(todayTotals);

    const allTimeTotalStake = await stake2.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const todayTotalStake = await stake2.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfToday,
            $lt: endOfToday
          }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const allTimeAmount = allTimeTotalStake.length > 0 ? allTimeTotalStake[0].totalAmount : 0;
    const todayAmount = todayTotalStake.length > 0 ? todayTotalStake[0].totalAmount : 0;

    // New: Aggregate total withdrawal amount and token where isapprove is true
    const totalWithdrawal = await WithdrawalModel.aggregate([
      {
        $match: { isapprove: true }
      },
      {
        $group: {
          _id: null,
          totalWithdrawalAmount: { $sum: "$withdrawAmount" },
          totalWithdrawalToken: { $sum: "$withdrawToken" }
        }
      }
    ]);

    const totalWithdrawalAmount = totalWithdrawal.length > 0 ? totalWithdrawal[0].totalWithdrawalAmount : 0;
    const totalWithdrawalToken = totalWithdrawal.length > 0 ? totalWithdrawal[0].totalWithdrawalToken : 0;

    // Respond with all data, including the new withdrawal totals
    return res.json({
      totaluser,
      activeUser,
      inactiveUser,
      allTimeTotals: allTimeFormatted,
      todayTotals: todayFormatted,
      allTimeAmount,
      todayAmount,
      totalWithdrawalAmount,   // New field
      totalWithdrawalToken     // New field
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard", async (req, res) => {
  try {
    const { user } = req.query;
    let data = await registration.findOne({ user });

    if (!data) {
      return res.status(404).json({ message: "User not found" });
    }

    let responseData = data.toObject();

    const conditions = [
      { key: "pOne_pending", packageId: 1, poolId: 1, reentry : 1, directs: { $lt: 2 } },
      //{ key: "pOne_recycle", packageId: 1, poolId: 1, reentry : 2, directs: 2 },
      { key: "pOne_recycle", packageId: 1, reentry : 2, directs: { $gte : 0}, poolId: { $gte: 0 }},
      //{ key: "pTwo_pending", packageId: 1, poolId: 2,  reentry : 1, directs: { $lt: 4 } },
      //{ key: "pTwo_recycle", packageId: 1, poolId: 2, reentry : 2, directs: 4 },
      { key: "pTwo_recycle", packageId: 2, reentry : 2, directs: { $gte : 0},poolId: { $gte: 0 } },
      //{ key: "pThree_pending", packageId: 1, poolId: 3,  reentry : 1, directs: { $lt: 8 } },
      //{ key: "pThree_recycle", packageId: 1, poolId: 3, reentry : 2, directs: 8 },
      //{ key: "pThree_recycle", packageId: 1, poolId: 3, reentry : 2, directs: { $gte : 0} },
      { key: "p2One_pending", packageId: 2, poolId: 1,  reentry : 1, directs: { $lt: 2 } },
      //{ key: "p2One_recycle", packageId: 2, poolId: 1, reentry : 2, directs: 2 },
      // { key: "p2One_recycle", packageId: 2, poolId: 1, reentry : 2, directs: { $gte : 0}},
      // { key: "p2Two_pending", packageId: 2, poolId: 2,  reentry : 1, directs: { $lt: 4 } },
      //{ key: "p2Two_recycle", packageId: 2, poolId: 2, reentry : 2, directs: 4 },
      // { key: "p2Two_recycle", packageId: 2, poolId: 2, reentry : 2, directs: { $gte : 0} },
      // { key: "p2Three_pending", packageId: 2, poolId: 3,  reentry : 1, directs: { $lt: 8 } },
      //{ key: "p2Three_recycle", packageId: 2, poolId: 3,  reentry : 2, directs: 8 },
      //{ key: "p2Three_recycle", packageId: 2, poolId: 3,  reentry : 2, directs: { $gte : 0} },
    ];

    for (let cond of conditions) {
      const query = {
        user: data.user,
        reentry : cond.reentry,
        packageId: cond.packageId,
        poolId: cond.poolId,
        directs: cond.directs,
      };
      
      responseData[cond.key] = await newuserplace.countDocuments(query);
      //responseData[cond.key] = 0;
    }

    res.json(responseData);
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/dashboardm28", async (req, res) => {
  try {
    const { user } = req.query;
    let data = await registration.findOne({ user });

    if (!data) {
      return res.status(404).json({ message: "User not found" });
    }

    const userincome = await getUserIncomeSummary(user);

    const uexp1 = await m28buy.findOne({ user: user, packageId : 1 }).sort({ createdAt: -1 });
    const uexp2 = await m28buy.findOne({ user: user, packageId : 2 }).sort({ createdAt: -1 });
    const uexp3 = await m28buy.findOne({ user: user, packageId : 3 }).sort({ createdAt: -1 });

    const expiry1 = uexp1?.expiry ?? 0;
    const expiry2 = uexp2?.expiry ?? 0;
    const expiry3 = uexp3?.expiry ?? 0;

    res.json({
      responseData : data,
      userincome,
      expiry1,
      expiry2,
      expiry3
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/dashboardmsure", async (req, res) => {
  try {
    const { user } = req.query;
    let data = await registration.findOne({ user });

    if (!data) {
      return res.status(404).json({ message: "User not found" });
    }

    const uplinedownline1 = await getSurroundingUsersWithAmounts1(data.uId, user)
    const uplinedownline2 = await getSurroundingUsersWithAmounts2(data.uId, user)
    const uplinedownline3 = await getSurroundingUsersWithAmounts3(data.uId, user)
    
    res.json({
      responseData : data,
      uplinedownline1,
      uplinedownline2,
      uplinedownline3
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/recentTransaction", async (req,res)=>{
  const {user} = req.query;
  const data = await PackageBuy.find({user}).sort({ createdAt: -1 }).limit(100);
  res.json(data)
})
router.get("/recentTransactionm28", async (req,res)=>{
  const {user} = req.query;
  const data = await m28buy.find({user}).sort({ createdAt: -1 }).limit(100);
  res.json(data)
})

router.get("/recentTransactionGlobal", async (req,res)=>{
  // const {user} = req.query;
  const data = await PackageBuy.find().sort({ createdAt: -1 });
  res.json(data)
})

router.get("/Income", async (req,res)=>{
  const {user} = req.query;
  const data = await UserIncome.find({receiver: user}).sort({ createdAt: -1 });

  const mergedData = await Promise.all(data.map(async (record) => {
    const userDetails = await registration.findOne({ user: record.sender }); // Assuming userId is stored in newuserplace records
    // console.log(userDetails)

    // Step 3: Merge the user details with the newuserplace record
    return {
      ...record.toObject(), // Convert Mongoose document to plain JavaScript object
      userId: userDetails ? userDetails.userId : null // Add user details to the record
    };
  }));

  // Step 4: Return the merged data as a JSON response
  res.json(mergedData);
  // res.json(data)
})

router.get("/Incomem28", async (req,res)=>{
  const {user} = req.query;
  const data = await m28income.find({receiver: user}).sort({ createdAt: -1 }).limit(100);

  const mergedData = await Promise.all(data.map(async (record) => {
    const userDetails = await registration.findOne({ user: record.sender }); // Assuming userId is stored in newuserplace records
    // console.log(userDetails)

    // Step 3: Merge the user details with the newuserplace record
    return {
      ...record.toObject(), // Convert Mongoose document to plain JavaScript object
      userId: userDetails ? userDetails.userId : null // Add user details to the record
    };
  }));

  // Step 4: Return the merged data as a JSON response
  res.json(mergedData);
  // res.json(data)
})

router.get("/sponsorIncome_ref_m28", async (req,res)=>{
  const {user} = req.query;
  const data = await sponsorincome.find({reciever: user}).sort({ createdAt: -1 }).limit(100);

  const mergedData = await Promise.all(data.map(async (record) => {
    const userDetails = await registration.findOne({ user: record.sender }); // Assuming userId is stored in newuserplace records
    // console.log(userDetails)

    // Step 3: Merge the user details with the newuserplace record
    return {
      ...record.toObject(), // Convert Mongoose document to plain JavaScript object
      userId: userDetails ? userDetails.userId : null // Add user details to the record
    };
  }));

  // Step 4: Return the merged data as a JSON response
  res.json(mergedData);
  // res.json(data)
})

router.get("/sponsorIncome_m28", async (req,res)=>{
  const {user} = req.query;
  const data = await m28SponsorIncome.find({reciever: user}).sort({ createdAt: -1 }).limit(100);

  const mergedData = await Promise.all(data.map(async (record) => {
    const userDetails = await registration.findOne({ user: record.sender }); // Assuming userId is stored in newuserplace records
    // console.log(userDetails)

    // Step 3: Merge the user details with the newuserplace record
    return {
      ...record.toObject(), // Convert Mongoose document to plain JavaScript object
      userId: userDetails ? userDetails.userId : null // Add user details to the record
    };
  }));

  // Step 4: Return the merged data as a JSON response
  res.json(mergedData);
  // res.json(data)
})

router.get("/levelUpgrade", async (req,res)=>{
  const {user} = req.query;
  const data = await levelupgrade.find({user: user}).sort({ createdAt: -1 }).limit(100);

  res.json(data);
  // res.json(data)
})

router.get("/upgradeIncome", async (req,res)=>{
  const {user} = req.query;
  const data = await upgradeincome.find({receiver: user}).sort({ createdAt: -1 }).limit(100);

 const mergedData = await Promise.all(data.map(async (record) => {
    const userDetails = await registration.findOne({ user: record.sender }); // Assuming userId is stored in newuserplace records
    // console.log(userDetails)

    // Step 3: Merge the user details with the newuserplace record
    return {
      ...record.toObject(), // Convert Mongoose document to plain JavaScript object
      userId: userDetails ? userDetails.userId : null // Add user details to the record
    };
  }));

  // Step 4: Return the merged data as a JSON response
  res.json(mergedData);
})

router.get("/newuserplace", async (req,res)=>{
  const {user} = req.query;
  const data = await newuserplace.find({referrer: user}).sort({ createdAt: -1 });
  res.json(data)
})
router.get("/newuserplacePool", async (req, res) => {
  const { user, poolId } = req.query;

  try {
    // Step 1: Fetch records from newuserplace collection
    const data = await newuserplace.find({ referrer: user, poolId: poolId }).sort({ createdAt: -1 });

    // Step 2: For each record, find the corresponding user details from the registration schema
    const mergedData = await Promise.all(data.map(async (record) => {
      const userDetails = await registration.findOne({ user: record.user }); // Assuming userId is stored in newuserplace records

      // Step 3: Merge the user details with the newuserplace record
      return {
        ...record.toObject(), // Convert Mongoose document to plain JavaScript object
        userId: userDetails ? userDetails.userId : null // Add user details to the record
      };
    }));

    // Step 4: Return the merged data as a JSON response
    res.json(mergedData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/newuserplacePooln", async (req, res) => {
  const { user, poolId, packageId } = req.query;

  try {
    let dir_chk = 0;
    if(Number(poolId) == 1){
      dir_chk = 2
    } else if(Number(poolId) == 2){
      dir_chk = 4
    } else {
      dir_chk = 8
    }

    //console.log("dir_chk ",dir_chk)

    const maxid_dta = await newuserplace
    .findOne({ user: user, poolId: poolId, packageId : packageId, directs : { $lt : dir_chk }  })
    .sort({ uid: 1 }) // sort by uid descending
    .limit(1); 

    // Step 1: Fetch records from newuserplace collection
    if(maxid_dta){
    const data = await newuserplace.find({ ref_id: maxid_dta.uid }).sort({ createdAt: 1 });

    // Step 2: For each record, find the corresponding user details from the registration schema
    const mergedData = await Promise.all(data.map(async (record) => {
      const userDetails = await registration.findOne({ user: record.user }); // Assuming userId is stored in newuserplace records

      // Step 3: Merge the user details with the newuserplace record
      return {
        ...record.toObject(), // Convert Mongoose document to plain JavaScript object
        userId: userDetails ? userDetails.userId : null ,// Add user details to the record
        refereruser: userDetails ? userDetails.referrer : null
      };
    }));

    // Step 4: Return the merged data as a JSON response
    res.json(mergedData);
  } else {
    res.json([]);
  }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/referralhistory", async (req, res) => {
  try {
    const { referrer } = req.query;

    // Fetch users referred by `referrer`
    const data = await registration.find({ referrer: referrer }).sort({ createdAt: -1 });

    // Fetch package purchases for referred users
    const data2 = await PackageBuy.find({
      user: { $in: data.map(d => d.user) },
      txHash: { $regex: /^0x/ }
    }).sort({ createdAt: -1 });

    // Filter only packageId === 2
    const filteredData = data2.filter(item => item.packageId === 2);

    const mergedData = await Promise.all(filteredData.map(async (record) => {
      const userDetails = await registration.findOne({ user: record.user }); // Assuming userId is stored in newuserplace records

      // Step 3: Merge the user details with the newuserplace record
      return {
        ...record.toObject(), // Convert Mongoose document to plain JavaScript object
        userId: userDetails ? userDetails.userId : null // Add user details to the record
      };
    }));

    // Merge data with corresponding package details
    // const mergedData = data.map(record => {
    //   const packageDetails = filteredData.find(p => p.user === record.user);
    //   return {
    //     ...record.toObject(),
    //     packageDetails: packageDetails || null // Add package details if found, else null
    //   };
    // });

    res.json({ data,mergedData });
  } catch (error) {
    console.error("Error fetching referral history:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get('/recycles', async (req, res) => {
  try {
    const { address } = req.query;

    // Records with packageId 1
    const data1 = await newuserplace.find({
      user : address,
      packageId : 1
    })
      .populate('user') // adjust field name if needed
      .sort({ directs: -1 });

    // Records with packageId 2
    const data2 = await newuserplace.find({
      user : address,
      packageId : 2
    })
      .populate('user')
      .sort({ directs: -1 });

    res.json({ data1, data2 });
  } catch (err) {
    console.error('Error fetching referrals:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});



router.get("/adminlogin", async (req,res)=>{
  const {email, password} = req.query;
  const data = await AdminCred.findOne({email, password});
  res.json(data)
})
router.get("/getallusers", async (req,res)=>{
  // const {email, password} = req.query;
  const data = await registration.find().sort({ createdAt: -1 }).limit(500);
  res.json(data)
})

router.get('/getAddressbyRefrralId', async (req, res) => {
  try {
    const { ref_id } = req.query;

    // Check if targetBusiness is provided and is a valid number
    if (!ref_id) {
      return res.status(400).json({ error: 'ref_id is required' });
    }

    // Find all stakeReward records matching the targetBusiness criteria
    const record = await registration.findOne({ user: ref_id });

   

    // Respond with the list of users and their associated registration details
    res.status(200).json(record.user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get("/getPackageDetail", async (req, res) => {
  try {
    const { user } = req.query;

    if (!user) {
      return res.status(400).json({ success: false, message: "User ID is required." });
    }

    // Get userId from Registration schema
    const registrationData = await registration.findOne({ user });

    if (!registrationData) {
      return res.status(404).json({
        success: false,
        message: "User not found in Registration schema.",
      });
    }

    const userId = registrationData.userId;

    // Fetch packages
    const packageData = await PackageBuy.find({ user }).sort({ createdAt: -1 });

    // Map userId into each package object
    const enrichedData = packageData.map((pkg) => ({
      ...pkg.toObject(),
      userId: userId,
    }));

    res.status(200).json({
      success: true,
      data: enrichedData,
      message: "Package details fetched successfully.",
    });
  } catch (err) {
    console.error("Error fetching package details:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching package details.",
    });
  }
});



router.get("/packagereport", async (req, res) => {
  try {
    const packages = await PackageBuy.find().sort({ createdAt: -1 }).limit(500);

    const data = await Promise.all(
      packages.map(async (pkg) => {
        const user = await registration.findOne({ user: pkg.user });
        return {
          ...pkg.toObject(),
          userId: user ? user.userId : null,
        };
      })
    );

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching package report:", error);
    res.status(500).json({ success: false, message: "Server Error. Please try again later." });
  }
});

router.get("/getclubreport", async (req, res) => {
  try {
    const { club } = req.query;

    const clubData = await newuserplace.find({ poolId: club }).sort({ createdAt: -1 }).limit(500);
    // .limit(50)

    const enrichedData = await Promise.all(
      clubData.map(async (entry) => {
        const user = await registration.findOne({ user: entry.user });
        return {
          ...entry.toObject(),
          userId: user ? user.userId : null,
          referrerId: user ? user.referrerId : null,
        };
      })
    );

    res.status(200).json({ success: true, data: enrichedData });
  } catch (error) {
    console.error("Error fetching club report:", error);
    res.status(500).json({ success: false, message: "Server Error. Please try again later." });
  }
});

router.get("/totaldata", async (req, res) => {
  try {
    const totalUsers = await registration.countDocuments();

    const [pool1Count, pool2Count, pool3Count] = await Promise.all([
      newuserplace.countDocuments({ poolId: 1 }),
      newuserplace.countDocuments({ poolId: 2 }),
      newuserplace.countDocuments({ poolId: 3 }),
    ]);

    res.json({
      success: true,
      totalUsers,
      pool1Users: pool1Count,
      pool2Users: pool2Count,
      pool3Users: pool3Count,
    });
  } catch (error) {
    console.error("Error in /totaldata API:", error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
});

// In your Express backend
// const apiKey = "54c9f3b7-340c-4840-a220-c122ae9e3225";
router.get("/get-coin-price", async (req, res) => {
  try {
    const { symbol } = req.query; // e.g., POL
    // const apiKey = "YOUR_CMC_API_KEY";

    const response = await axios.get(
      "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest",
      {
        params: {
          symbol: symbol || "POL",
          convert: "USD",
        },
        headers: {
          "X-CMC_PRO_API_KEY": "54c9f3b7-340c-4840-a220-c122ae9e3225",
        },
      }
    );

    const price = response.data.data[symbol]?.quote.USD.price;

    res.json({ success: true, price });
  } catch (err) {
    console.error("CMC API Error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch price" });
  }
});

router.get("/UserWithdraw", async (req, res) => {
  try {
    const { address } = req.query;

    let data;
    if (address) {
      data = await UserIncome.find({
        receiver: address,
        income_status: 0,
        pay_status: 0,
        createdAt: {
          $gt: new Date("2025-05-08T17:59:00.370+00:00")
        }
      }).limit(50);
    } else {
      data = await UserIncome.aggregate([
        {
          $match: {
            income_status: 0,
            pay_status: 0,
            createdAt: {
              $gt: new Date("2025-05-08T17:59:00.370Z")
            }
          }
        },
        {
          $limit: 50
        }
      ]);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post('/update-income', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "IDs array is required." });
    }

    // Convert strings to ObjectId if needed
   // const objectIds = ids.map(id => mongoose.Types.ObjectId(id));

    const result = await UserIncome.updateMany(
      { _id: { $in: ids } },
      { $set: { pay_status: 1 } }
    );

    res.status(200).json({ message: "Updated successfully", modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/UserWithdrawss', async (req, res) => {
  try {
    const address = req.query.address;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build query object dynamically
    let query = {};
    if (address) {
      query = {
        receiver: address,
        send_hash: { $ne: "0" }
      };
    } else {
      query = {
        send_hash: { $ne: "0" }
      };
    }

    // Fetch total count for pagination
    const total = await UserIncome.countDocuments(query);

    // Fetch paginated results
    const result = await UserIncome.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      result,
    });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/UserWithdrawDetails", async (req, res) => {
  try {
    const { address } = req.query;

    let data, summary;

    const matchCondition = {
      income_status: 0,
      pay_status:0,
      createdAt: {
        $gt: new Date("2025-05-08T17:59:00.370Z")
      }
    };

    if (address) {
      matchCondition.receiver = address;

      // Fetch matching data
      //data = await UserIncome.find(matchCondition);

      // Get total records and amount
      summary = await UserIncome.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: null,
            totalRecords: { $sum: 1 },
            totalAmount: { $sum: "$amount" }
          }
        }
      ]);
    } else {
      // Fetch all matching data
      //data = await UserIncome.find(matchCondition);

      // Get total records and amount
      summary = await UserIncome.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: null,
            totalRecords: { $sum: 1 },
            totalAmount: { $sum: "$amount" }
          }
        }
      ]);
    }

    res.json({
      //data,
      totalRecords: summary[0]?.totalRecords || 0,
      totalAmount: summary[0]?.totalAmount || 0
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

const getUserIncomeSummary = async (user) => {
  try {
    const getPackageWiseIncome = async (model) => {
      return await model.aggregate([
        { $match: { receiver: user, packageId: { $in: [1, 2, 3] } } },
        {
          $group: {
            _id: "$packageId",
            totalUsdAmt: { $sum: "$amount" }
          }
        }
      ]);
    };

    const getTotalIncome = async (model) => {
      const total = await model.aggregate([
        { $match: { receiver: user } },
        { $group: { _id: null, totalUsdAmt: { $sum: "$amount" } } }
      ]);
      return total[0]?.totalUsdAmt || 0;
    };

    // Get total income from all three schemas
    const [m28Total, sponsorTotal, m28SponsorTotal] = await Promise.all([
      getTotalIncome(m28income),
      getTotalIncome(sponsorincome),
      getTotalIncome(m28SponsorIncome),
    ]);

    // Get package-wise income from all three schemas
    const [m28Packages, sponsorPackages, m28SponsorPackages] = await Promise.all([
      getPackageWiseIncome(m28income),
      getPackageWiseIncome(sponsorincome),
      getPackageWiseIncome(m28SponsorIncome),
    ]);

    // Combine all package-wise incomes
    const combinedPackages = {
      package1: 0,
      package2: 0,
      package3: 0,
    };

    const addPackageIncome = (packages) => {
      packages.forEach(pkg => {
        if (pkg._id === 1) combinedPackages.package1 += pkg.totalUsdAmt;
        if (pkg._id === 2) combinedPackages.package2 += pkg.totalUsdAmt;
        if (pkg._id === 3) combinedPackages.package3 += pkg.totalUsdAmt;
      });
    };

    addPackageIncome(m28Packages);
    addPackageIncome(sponsorPackages);
    addPackageIncome(m28SponsorPackages);

    return {
      totalIncome: m28Total + sponsorTotal + m28SponsorTotal,
      ...combinedPackages
    };

  } catch (err) {
    console.error("Error while aggregating income:", err);
    throw err;
  }
};



const getUserIncomeSummaryy = async (user) => {
  try {
    // Total sum of usdAmt for the user
    const totalIncome = await m28income.aggregate([
      { $match: { receiver: user } },
      { $group: { _id: null, totalUsdAmt: { $sum: "$amount" } } }
    ]);

    // Separate sum for packageId 1, 2, 3
    const packageWiseIncome = await m28income.aggregate([
      { $match: { receiver: user, packageId: { $in: [1, 2, 3] } } },
      {
        $group: {
          _id: "$packageId",
          totalUsdAmt: { $sum: "$amount" }
        }
      }
    ]);

    // Format the result for packageIds
    const incomeByPackage = {
      package1: 0,
      package2: 0,
      package3: 0,
    };

    packageWiseIncome.forEach(pkg => {
      if (pkg._id === 1) incomeByPackage.package1 = pkg.totalUsdAmt;
      if (pkg._id === 2) incomeByPackage.package2 = pkg.totalUsdAmt;
      if (pkg._id === 3) incomeByPackage.package3 = pkg.totalUsdAmt;
    });

    return {
      totalIncome: totalIncome[0]?.totalUsdAmt || 0,
      ...incomeByPackage
    };

  } catch (err) {
    console.error("Error while aggregating income:", err);
    throw err;
  }
};


const getUserIncomeSummarsasdy = async (user) => {
  try {
    const getTotalAndPackageIncome = async (model) => {
      const total = await model.aggregate([
        { $match: { receiver: user } },
        { $group: { _id: null, totalAmt: { $sum: "$amount" } } }
      ]);

      const packageWise = await model.aggregate([
        { $match: { receiver: user, packageId: { $in: [1, 2, 3] } } },
        {
          $group: {
            _id: "$packageId",
            totalAmt: { $sum: "$amount" }
          }
        }
      ]);

      const packageIncome = { package1: 0, package2: 0, package3: 0 };
      packageWise.forEach(pkg => {
        if (pkg._id === 1) packageIncome.package1 = pkg.totalAmt;
        if (pkg._id === 2) packageIncome.package2 = pkg.totalAmt;
        if (pkg._id === 3) packageIncome.package3 = pkg.totalAmt;
      });

      return {
        total: total[0]?.totalAmt || 0,
        ...packageIncome
      };
    };

    // Get income details from all three schemas
    const m28IncomeData = await getTotalAndPackageIncome(m28income);
    const sponsorIncomeData = await getTotalAndPackageIncome(sponsorincome);
    const m28SponsorIncomeData = await getTotalAndPackageIncome(m28SponsorIncome);

    // Combine package-wise income across all schemas
    const combinedPackages = {
      package1: m28IncomeData.package1 + sponsorIncomeData.package1 + m28SponsorIncomeData.package1,
      package2: m28IncomeData.package2 + sponsorIncomeData.package2 + m28SponsorIncomeData.package2,
      package3: m28IncomeData.package3 + sponsorIncomeData.package3 + m28SponsorIncomeData.package3,
    };

    return {
      totalIncome: m28IncomeData.total,
      sponsorIncome: sponsorIncomeData.total,
      m28SponsorIncome: m28SponsorIncomeData.total,
      ...combinedPackages
    };

  } catch (err) {
    console.error("Error while aggregating income:", err);
    throw err;
  }
};


const getSurroundingUsersWithAmounts1 = async (myUid, myId) => {
  const myRecord = await registration.findOne({ uId: myUid }).lean();
  if (!myRecord) throw new Error("User not found");

  const usersBefore = await registration.find({ uId: { $lt: myUid } })
    .sort({ uId: -1 })
    .limit(10)
    .lean();

  const usersAfter = await registration.find({ uId: { $gt: myUid } })
    .sort({ uId: 1 })
    .limit(10)
    .lean();

  const beforeUserIds = usersBefore.map(user => user.user);
  const afterUserIds = usersAfter.map(user => user.user);

  // --- Get Downline Data ---
  const downlineData = await globaldownline.aggregate([
    {
      $match: {
        sender: { $in: beforeUserIds },
        receiver: myId,
        packageId : 1
      }
    },
    {
      $group: {
        _id: "$sender",
        totalAmount: { $sum: "$amount" }
      }
    }
  ]);

  // --- Get Upline Data ---
  const uplineData = await globalupline.aggregate([
    {
      $match: {
        sender: { $in: afterUserIds },
        receiver: myId,
        packageId : 1
      }
    },
    {
      $group: {
        _id: "$sender",
        totalAmount: { $sum: "$amount" }
      }
    }
  ]);

  // --- Get Package Value for Before Users ---
  // const beforePackageData = await packagebuy.aggregate([
  //   { $match: { user: { $in: beforeUserIds } } },
  //   {
  //     $group: {
  //       _id: "$user",
  //       totalValue: { $sum: "$usdAmt" }
  //     }
  //   }
  // ]);

  // --- Get Package Value for After Users ---
  // const afterPackageData = await packagebuy.aggregate([
  //   { $match: { user: { $in: afterUserIds } } },
  //   {
  //     $group: {
  //       _id: "$user",
  //       totalValue: { $sum: "$usdAmt" }
  //     }
  //   }
  // ]);

  // --- Convert Results to Maps ---
  const downlineMap = Object.fromEntries(downlineData.map(d => [d._id, d.totalAmount]));
  const uplineMap = Object.fromEntries(uplineData.map(d => [d._id, d.totalAmount]));

  // const beforePackageMap = Object.fromEntries(beforePackageData.map(p => [p._id, p.totalValue]));
  // const afterPackageMap = Object.fromEntries(afterPackageData.map(p => [p._id, p.totalValue]));

  // --- Final Output Arrays ---
  const beforeWithAmounts = usersBefore.map(user => ({
    uId: user.uId,
    user: user.user,
    userId: user.userId,
    amount: downlineMap[user.user] || 0,
    //packageValue: beforePackageMap[user.user] || 0
  }));

  const afterWithAmounts = usersAfter.map(user => ({
    uId: user.uId,
    user: user.user,
    userId: user.userId,
    amount: uplineMap[user.user] || 0,
    //packageValue: afterPackageMap[user.user] || 0
  }));

  const result = [
    ...beforeWithAmounts.reverse(),
    {
      uId: myRecord.uId,
      user: myRecord.user,
      userId: myRecord.userId,
      amount: 0,
      packageValue: 0
    },
    ...afterWithAmounts
  ];

  return result;
};

const getSurroundingUsersWithAmounts2 = async (myUid, myId) => {
  const myRecord = await registration.findOne({ uId: myUid }).lean();
  if (!myRecord) throw new Error("User not found");

  const usersBefore = await registration.find({ uId: { $lt: myUid } })
    .sort({ uId: -1 })
    .limit(10)
    .lean();

  const usersAfter = await registration.find({ uId: { $gt: myUid } })
    .sort({ uId: 1 })
    .limit(10)
    .lean();

  const beforeUserIds = usersBefore.map(user => user.user);
  const afterUserIds = usersAfter.map(user => user.user);

  // --- Get Downline Data ---
  const downlineData = await globaldownline.aggregate([
    {
      $match: {
        sender: { $in: beforeUserIds },
        receiver: myId,
        packageId : 2
      }
    },
    {
      $group: {
        _id: "$sender",
        totalAmount: { $sum: "$usdAmt" }
      }
    }
  ]);

  // --- Get Upline Data ---
  const uplineData = await globalupline.aggregate([
    {
      $match: {
        sender: { $in: afterUserIds },
        receiver: myId,
        packageId : 2
      }
    },
    {
      $group: {
        _id: "$sender",
        totalAmount: { $sum: "$usdAmt" }
      }
    }
  ]);

  // --- Get Package Value for Before Users ---
  // const beforePackageData = await packagebuy.aggregate([
  //   { $match: { user: { $in: beforeUserIds } } },
  //   {
  //     $group: {
  //       _id: "$user",
  //       totalValue: { $sum: "$usdAmt" }
  //     }
  //   }
  // ]);

  // --- Get Package Value for After Users ---
  // const afterPackageData = await packagebuy.aggregate([
  //   { $match: { user: { $in: afterUserIds } } },
  //   {
  //     $group: {
  //       _id: "$user",
  //       totalValue: { $sum: "$usdAmt" }
  //     }
  //   }
  // ]);

  // --- Convert Results to Maps ---
  const downlineMap = Object.fromEntries(downlineData.map(d => [d._id, d.totalAmount]));
  const uplineMap = Object.fromEntries(uplineData.map(d => [d._id, d.totalAmount]));

  // const beforePackageMap = Object.fromEntries(beforePackageData.map(p => [p._id, p.totalValue]));
  // const afterPackageMap = Object.fromEntries(afterPackageData.map(p => [p._id, p.totalValue]));

  // --- Final Output Arrays ---
  const beforeWithAmounts = usersBefore.map(user => ({
    uId: user.uId,
    user: user.user,
    userId: user.userId,
    amount: downlineMap[user.user] || 0,
    //packageValue: beforePackageMap[user.user] || 0
  }));

  const afterWithAmounts = usersAfter.map(user => ({
    uId: user.uId,
    user: user.user,
    userId: user.userId,
    amount: uplineMap[user.user] || 0,
    //packageValue: afterPackageMap[user.user] || 0
  }));

  const result = [
    ...beforeWithAmounts.reverse(),
    {
      uId: myRecord.uId,
      user: myRecord.user,
      userId: myRecord.userId,
      amount: 0,
      packageValue: 0
    },
    ...afterWithAmounts
  ];

  return result;
};

const getSurroundingUsersWithAmounts3 = async (myUid, myId) => {
  const myRecord = await registration.findOne({ uId: myUid }).lean();
  if (!myRecord) throw new Error("User not found");

  const usersBefore = await registration.find({ uId: { $lt: myUid } })
    .sort({ uId: -1 })
    .limit(10)
    .lean();

  const usersAfter = await registration.find({ uId: { $gt: myUid } })
    .sort({ uId: 1 })
    .limit(10)
    .lean();

  const beforeUserIds = usersBefore.map(user => user.user);
  const afterUserIds = usersAfter.map(user => user.user);

  // --- Get Downline Data ---
  const downlineData = await globaldownline.aggregate([
    {
      $match: {
        sender: { $in: beforeUserIds },
        receiver: myId,
        packageId : 3
      }
    },
    {
      $group: {
        _id: "$sender",
        totalAmount: { $sum: "$usdAmt" }
      }
    }
  ]);

  // --- Get Upline Data ---
  const uplineData = await globalupline.aggregate([
    {
      $match: {
        sender: { $in: afterUserIds },
        receiver: myId,
        packageId : 3
      }
    },
    {
      $group: {
        _id: "$sender",
        totalAmount: { $sum: "$usdAmt" }
      }
    }
  ]);

  // --- Get Package Value for Before Users ---
  // const beforePackageData = await packagebuy.aggregate([
  //   { $match: { user: { $in: beforeUserIds } } },
  //   {
  //     $group: {
  //       _id: "$user",
  //       totalValue: { $sum: "$usdAmt" }
  //     }
  //   }
  // ]);

  // --- Get Package Value for After Users ---
  // const afterPackageData = await packagebuy.aggregate([
  //   { $match: { user: { $in: afterUserIds } } },
  //   {
  //     $group: {
  //       _id: "$user",
  //       totalValue: { $sum: "$usdAmt" }
  //     }
  //   }
  // ]);

  // --- Convert Results to Maps ---
  const downlineMap = Object.fromEntries(downlineData.map(d => [d._id, d.totalAmount]));
  const uplineMap = Object.fromEntries(uplineData.map(d => [d._id, d.totalAmount]));

  // const beforePackageMap = Object.fromEntries(beforePackageData.map(p => [p._id, p.totalValue]));
  // const afterPackageMap = Object.fromEntries(afterPackageData.map(p => [p._id, p.totalValue]));

  // --- Final Output Arrays ---
  const beforeWithAmounts = usersBefore.map(user => ({
    uId: user.uId,
    user: user.user,
    userId: user.userId,
    amount: downlineMap[user.user] || 0,
    //packageValue: beforePackageMap[user.user] || 0
  }));

  const afterWithAmounts = usersAfter.map(user => ({
    uId: user.uId,
    user: user.user,
    userId: user.userId,
    amount: uplineMap[user.user] || 0,
    //packageValue: afterPackageMap[user.user] || 0
  }));

  const result = [
    ...beforeWithAmounts.reverse(),
    {
      uId: myRecord.uId,
      user: myRecord.user,
      userId: myRecord.userId,
      amount: 0,
      packageValue: 0
    },
    ...afterWithAmounts
  ];

  return result;
};
;





// router.get("/getPackageDetail",async (req,res)=>{
//   const {user} = req.query;
//   const data = await PackageBuy.find({user}).sort({ createdAt: -1 });
//   res.json(data)
// }
// );


// router.get("/home", async (req,res)=>{
//   // const hello = "Hello World";
//   const hello = "Hello0000 Worldxx";
//   res.json({hello})
// })

function generateRandomUid(length) {
  const bytes = crypto.randomBytes(Math.ceil(length / 2));
  return bytes.toString('hex').slice(0, length);
}

router.get("/updateNewuserplace", async (req, res) => {
  try {
    const { user, txHash } = req.query;

    const issv = await PackageBuy.create({
              user: user,
              packageId: 1,
              poolId: 1,
              amount: 5,
              POLCoinAmt: 21,
              txHash: txHash
            });

            if(issv){
               await newuserplace.create({
                          user: user,
                          packageId: 1,
                          poolId : 1,
                          txHash : generateRandomUid(50)
                        })

               res.status(200).json({ message : "Data Save Successfully" });         
            }
    
    
  } catch (error) {
    console.error("Error fetching club report:", error);
    res.status(500).json({ success: false, message: "Server Error. Please try again later." });
  }
});

module.exports = router;
