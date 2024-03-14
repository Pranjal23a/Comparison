$(document).ready(function () {
    const AmazonResults = $('#amazon-data');
    const FlipkartResults = $('#flipkart-data');
    const spinner = $('#spinner');
    const loading = $('.loading');
    const searchQueryInput = $('#search-query');
    const searchButton = $('#search-button');

    // Attach an event handler to the search button click
    searchButton.on('click', async function (event) {
        // Prevent the default form submission behavior
        event.preventDefault();
        AmazonResults.html('');
        FlipkartResults.html('');
        const searchQuery = searchQueryInput.val();
        searchQueryInput.blur();
        spinner.show();
        loading.show();
        // Check if the search query is not empty before making the AJAX request
        if (searchQuery.trim() !== '') {
            try {
                // Make both AJAX requests concurrently using Promise.all
                const [amazonData, flipkartData] = await Promise.all([
                    $.ajax({
                        url: `/amazon/api/${searchQuery}`,
                        dataType: 'json',
                        timeout: 15000,
                    }),
                    $.ajax({
                        url: `/flipkart/api/${searchQuery}`,
                        dataType: 'json',
                        timeout: 15000,
                    })
                ]);

                // Handle the received data and update the search results on the page

                // Update the search results for Amazon
                updateSearchResults(AmazonResults, amazonData);

                // Update the search results for Flipkart
                updateSearchResults(FlipkartResults, flipkartData);

            } catch (error) {
                console.error('Error:', error);
            } finally {
                spinner.hide();
                loading.hide();
            }
        } else {
            // Handle the case where the search query is empty
            console.log('Search query is empty. Please enter a search term.');
            spinner.hide();
            loading.hide();
        }
    });

    function updateSearchResults(resultsContainer, results) {
        // Clear previous search results
        resultsContainer.html('');

        // Loop through the product data and append it to the resultsContainer tag
        results.forEach(function (product) {
            const truncatedName = truncateWords(product.name, 10);
            const productHTML = `
                <div class="product" >
                    <img src="${product.image}" alt="${product.name}">
                    <h3 title="${product.name}">${truncatedName}</h3>
                    <p>Price: ${product.price}</p>
                    <p>Rating: ${product.rating}</p>
                    <a href="${product.url}" target="_blank">View Product</a>
                </div>
            `;

            // Append the product HTML to the resultsContainer tag
            resultsContainer.append(productHTML);
        });
    }

    function truncateWords(text, maxWords) {
        // Split the text into words
        const words = text.split(' ');

        // Take only the first 'maxWords' words
        const truncatedWords = words.slice(0, maxWords);

        // Join the words back into a string
        const truncatedText = truncatedWords.join(' ');

        return truncatedText + (words.length > maxWords ? '...' : ''); // Add ellipsis if there are more words
    }
});

