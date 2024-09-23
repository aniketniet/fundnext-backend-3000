const FAQs = require ('../model/faqs')


//Get FAQs
const getFAQs = async (req, res) => {
    try {
        const faqs = await FAQs.find();
        res.status(200).json(faqs);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


module.exports = {getFAQs};