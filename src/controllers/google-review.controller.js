const axios = require('axios');


exports.getGoogleReviews = async (req, res) => {
    try{

        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        const placeId = process.env.GOOGLE_PLACE_ID
        const URL = `https://places.googleapis.com/v1/places/${placeId}`;

        const FIELD_MASK = 'rating,userRatingCount,reviews,displayName';

    
        const response = await axios.get(URL,{
            headers: {
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': FIELD_MASK
            }
        });

 
        const filteredData = {
            rating: response.data.rating,
            totalReviews: response.data.userRatingCount,
            businessName: response.data.displayName.text,
            reviews: response.data.reviews.map(rev => ({
                author: rev.authorAttribution.displayName,
                photo: rev.authorAttribution.photoUri,
                rating: rev.rating,
                text: rev.text.text,
                relativeTime: rev.relativePublishTimeDescription,
                publishDate: rev.publishTime
            }))
        };

        return res.status(200).json({
            ok: true,
            message: 'Google reviews retrieved successfully',
            data: filteredData
        });

    } catch(error){
        console.error('Error al obtener reseñas de Google:', error.message);

        if (error.response) {
            return res.status(error.response.status).json({
                ok: false,
                message: error.response.data.error?.message || 'Error en la API externa de Google',
                type: 'EXTERNAL_API_ERROR'
            });
        }

        res.status(500).json({
            ok: false,
            message: 'Internal server error while fetching Google reviews',
            type: 'SERVER_ERROR'
        });
    }
};