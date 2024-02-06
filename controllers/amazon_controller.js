const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');


// Function getting product URL
async function getProductURL(query) {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    try {
        const URL = 'https://www.amazon.in/';
        await page.goto(URL);

        const searchBox = '#twotabsearchtextbox';
        await page.type(searchBox, query);
        await page.keyboard.press('Enter');

        await page.waitForNavigation();

        // Get the current URL after search
        const newURL = page.url();
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
        const URL = await getProductURL(query);

        // Simulate headers to mimic a real browser request
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        };

        const response = await axios.get(URL, { headers });
        const data = response.data;

        // Use Cheerio to parse HTML if needed
        const $ = cheerio.load(data);
        const productsData = [];
        const productContainer = $('div.puis-card-container.s-card-container');

        let idCounter = 1;
        // Extract product information
        productContainer.each((index, element) => {
            const productElement = $(element);
            const productName = productElement.find('h2 span.a-size-medium').text().trim();
            const productImage = productElement.find('img.s-image').attr('src');
            let productPrice = productElement.find('.a-price .a-price-whole').text().trim();
            const productRating = productElement.find('.a-icon-star-small .a-icon-alt').text().trim();
            const relativeProductLink = productElement.find('a.a-link-normal.s-no-outline').attr('href');
            productPrice = '₹' + productPrice;

            // Prepend base URL to relative product link
            const productLink = `https://www.amazon.in${relativeProductLink}`;

            // Build the product data object
            const productData = {
                id: idCounter++,
                name: productName,
                image: productImage,
                price: productPrice,
                rating: productRating,
                url: productLink,
            };
            if (productName && productImage && productPrice && productRating && productLink) {
                productsData.push(productData);
            }
        });

        if (productsData) {
            console.log(productsData);
            return productsData;
        }
        // // when products are vertical
        else {
            const productsData = [];
            const productContainer = $('div.a-section.a-spacing-base');

            let idCounter = 1;
            // Extract product information
            productContainer.each((index, element) => {
                const productElement = $(element);
                const productName = productElement.find('h2.a-size-mini.a-spacing-none.a-color-base.s-line-clamp-3 span.a-size-base-plus.a-color-base.a-text-normal').text().trim();
                const productImage = productElement.find('div.a-section.aok-relative.s-image-square-aspect img.s-image').attr('src');
                let productPrice = productElement.find('a.a-link-normal.s-no-hover.s-underline-text.s-underline-link-text.s-link-style.a-text-normal span.a-price-whole').text().trim();
                const productRating = productElement.find('i.a-icon.a-icon-star-small.a-star-small-4.aok-align-bottom span.a-icon-alt').text().trim();
                const relativeProductLink = productElement.find('a.a-link-normal.s-no-outline').attr('href');
                productPrice = '₹' + productPrice;

                // Prepend base URL to relative product link
                const productLink = `https://www.amazon.in${relativeProductLink}`;

                // Build the product data object
                const productData = {
                    id: idCounter++,
                    name: productName,
                    image: productImage,
                    price: productPrice,
                    rating: productRating,
                    url: productLink,
                };
                if (productName && productImage && productPrice && productRating && productLink) {
                    productsData.push(productData);
                }
            });
            return productsData;
        }
    }
    catch (error) {
        console.error('Error in getting data:', error);
        throw error;
    }
}

// Returning API created
module.exports.ApiData = async function (req, res) {
    try {
        const searchQuery = req.params.name;
        const searchResults = await buildData(searchQuery);
        // console.log(searchResults);
        return res.json(searchResults);

    } catch (err) {
        console.error('Error in search:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
