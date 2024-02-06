module.exports.home = async function (req, res) {
    try {
        // If neither admin nor staff, render the home page
        return res.render('home', {
            title: "Home"
        });
    } catch (err) {
        console.log("Error in home controller:", err);
        if (err.name === 'SomeSpecificError') {
            console.log('An error occurred. Please try again later.');
            // req.flash('error', 'An error occurred. Please try again later.');
        } else {
            console.log('Unexpected error. Please contact support.');
            // req.flash('error', 'Unexpected error. Please contact support.');
        }
        return res.redirect("/");
    }
}
