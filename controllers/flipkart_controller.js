let puppeteer = require('puppeteer');
let cheerio = require('cheerio');
let axios = require('axios');


// Function getting product URL
async function getProductURL(query) {
    let browser = await puppeteer.launch({ headless: 'new' });
    let page = await browser.newPage();

    try {
        let URL = 'https://www.flipkart.com/';
        await page.goto(URL);

        let searchBox = '.Pke_EE';
        await page.type(searchBox, query);
        await page.keyboard.press('Enter');

        await page.waitForNavigation();

        // Get the current URL after search
        let newURL = page.url();
        return newURL;
    } catch (error) {
        console.error('Error in getting URL:', error);
        throw error;
    } finally {
        await browser.close();
    }
}


// Function getting data
async function buildData(query) {
    try {
        let URL = await getProductURL(query);

        // Simulate headers to mimic a real browser request
        let headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        };

        let response = await axios.get(URL, { headers });
        let data = response.data;

        // Use Cheerio to parse HTML if needed
        let $ = cheerio.load(data);
        let productsData = [];
        let productContainer = $('div._1AtVbE.col-12-12');

        let idCounter = 111;
        // Extract product information
        productContainer.each((index, element) => {
            let productElement = $(element);
            let productName = productElement.find('div._4rR01T').text().trim();
            let productImage = productElement.find('img._396cs4').attr('src');
            let productPrice = productElement.find('div._25b18c div._30jeq3._1_WHN1').text().trim();
            let productRating = productElement.find('div._3LWZlK').text().trim();
            let relativeProductLink = productElement.find('div._2kHMtA a._1fQZEK').attr('href');

            // Prepend base URL to relative product link
            let productLink = `https://www.flipkart.com${relativeProductLink}`;

            // Build the product data object
            let productData = {
                id: idCounter++,
                name: productName,
                image: productImage,
                price: productPrice,
                rating: productRating + " out of 5 stars",
                url: productLink,
            };
            if (productName && productImage && productPrice && productRating && productLink) {
                productsData.push(productData);
            }
        });

        // console.log(productsData);
        if (productsData.length < 1) {
            productContainer = $('div._4ddWXP');

            let idCounter = 111;
            // Extract product information
            productContainer.each((index, element) => {
                productElement = $(element);
                productName = productElement.find('a.s1Q9rs').text().trim();
                productImage = productElement.find('img._396cs4').attr('src');
                productPrice = productElement.find('div._25b18c div._30jeq3').text().trim();
                productRating = productElement.find('div._3LWZlK').text().trim();
                relativeProductLink = productElement.find('a._8VNy32').attr('href');

                // Prepend base URL to relative product link
                productLink = `https://www.flipkart.com${relativeProductLink}`;

                // Build the product data object
                productData = {
                    id: idCounter++,
                    name: productName,
                    image: productImage,
                    price: productPrice,
                    rating: productRating + " out of 5 stars",
                    url: productLink,
                };
                if (productName && productImage && productPrice && productRating && productLink) {
                    productsData.push(productData);
                }
            });
            // console.log(productsData);
        }
        return productsData;
    } catch (error) {
        console.error('Error in getting data:', error);
        throw error;
    }
}

// Returning API created
module.exports.ApiData = async function (req, res) {
    try {
        let searchQuery = req.params.name;
        let searchResults = await buildData(searchQuery);
        console.log(searchResults);
        return res.json(searchResults);

    } catch (err) {
        console.error('Error in search:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
