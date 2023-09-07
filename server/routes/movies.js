const router = require("express").Router();
const Movie = require("../models/Movie");
const movies = require("../config/movies.json");

router.get("/movies", async (req, res) => {
	try {
		const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 5;
		const search = req.query.search || "";
		let sort = req.query.sort || "rating:desc"; // Default to "rating:desc" if not provided
		let genre = req.query.genre || "All";

		const genreOptions = [
			"Action",
			"Romance",
			"Fantasy",
			"Drama",
			"Crime",
			"Adventure",
			"Thriller",
			"Sci-fi",
			"Music",
			"Family",
		];

		genre === "All"
			? (genre = [...genreOptions])
			: (genre = req.query.genre.split(","));

		// Split the sort query parameter into field and order
		const sortParts = sort.split(":");
		const sortBy = {};
		if (sortParts.length === 2) {
			sortBy[sortParts[0]] = sortParts[1];
		} else {
			sortBy[sort] = "desc"; // Default sorting order to "desc" if not provided
		}

		const movies = await Movie.find({ name: { $regex: search, $options: "i" } })
			.where("genre")
			.in([...genre])
			.sort(sortBy)
			.skip(page * limit)
			.limit(limit);

		const total = await Movie.countDocuments({
			genre: { $in: [...genre] },
			name: { $regex: search, $options: "i" },
		});

		const response = {
			error: false,
			total,
			page: page + 1,
			limit,
			genres: genreOptions,
			movies,
		};

		res.status(200).json(response);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: true, message: "Internal Server Error" });
	}
});

const insertMovies = async () => {
	try {
		const docs = await Movie.insertMany(movies);
		return Promise.resolve(docs);
	} catch (err) {
		return Promise.reject(err);
	}
};

insertMovies()
	.then((docs) => console.log(docs))
	.catch((err) => console.error(err));

module.exports = router;
