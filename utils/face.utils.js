// const axios = require("axios");

// class FaceUtils {
//     // constructor() {
//     //     this.apiKey = "YOUR_FACE++_API_KEY";
//     //     this.apiSecret = "YOUR_FACE++_API_SECRET";
//     //     this.compareUrl = "https://api-us.faceplusplus.com/facepp/v3/compare";
//     // }

//     async compareFaces(token1, token2) {
//         try {
//             const response = await axios.post( process.env.COMPARE_URL, {
//                 api_key: process.env.FACE_API_KEY,//, this.apiKey,
//                 api_secret: process.env.FACE_API_SECRET, // this.apiSecret,
//                 face_token1: token1,
//                 face_token2: token2,
//             });

//             if (response.data.confidence) {
//                 return response.data.confidence; // Confidence score as percentage match
//             }

//             return 0; // No match found
//         } catch (error) {
//             console.error("Error in compareFaces:", error); 
//             return 0; // Return 0 if there's an error
//         }
//     }
// }

// module.exports =  FaceUtils;