import React, { useEffect, useState } from "react"
import "./movie.css"
import { useParams } from "react-router-dom"

const Movie = () => {
    const [currentMovieDetail, setMovie] = useState()
    const [ratingDistribution, setRatingDistribution] = useState({});
    const [noisedRatingDistribution, setNoisedRatingDistribution] = useState({});
    const [newRating, setNewRating] = useState(5);
    const [sparkRawRatings, setSparkRawRatings] = useState({});
    const [sparkNoisedRatings, setSparkNoisedRatings] = useState({});
    const { id } = useParams()

    useEffect(() => {
        getData();
        getRatingDistribution();
        window.scrollTo(0, 0);
    }, [id])

    const getData = () => {
        fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=4e44d9029b1270a757cddc766a1bcb63&language=en-US`)
            .then(res => res.json())
            .then(data => setMovie(data))
    }

    const getRatingDistribution = () => {
        const previousRatingDistribution = { ...ratingDistribution };
        const previousNoisedRatingDistribution = { ...noisedRatingDistribution };

        fetch(`http://127.0.0.1:8000/v1/movie/get_rating_distribution/${id % 50}`)
            .then(res => res.json())
            .then(data => {
                setRatingDistribution(data.rating_distribution)
                setNoisedRatingDistribution(data.noised_rating_distribution)

                const updatedSparkRawRatings = {};
                for (const rating of Object.keys(data.rating_distribution)) {
                    if (data.rating_distribution[rating] !== previousRatingDistribution[rating]) {
                        updatedSparkRawRatings[rating] = true;
                    }
                }
                setSparkRawRatings(updatedSparkRawRatings);

                const updatedSparkNoisedRatings = {};
                for (const rating of Object.keys(data.noised_rating_distribution)) {
                    if (data.noised_rating_distribution[rating] !== previousNoisedRatingDistribution[rating]) {
                        updatedSparkNoisedRatings[rating] = true;
                    }
                }
                setSparkNoisedRatings(updatedSparkNoisedRatings);

                setTimeout(() => {
                    setSparkRawRatings({});
                    setSparkNoisedRatings({});
                }, 500);
            })
    }

    // render bars in two lines
    const renderRatingDistribution = () => {
        const maxCount = Math.max(
            ...Object.values(ratingDistribution),
            ...Object.values(noisedRatingDistribution)
        );

        return Object.entries(ratingDistribution).map(([rating, count]) => {
            const noisedCount = noisedRatingDistribution[rating] || 0;
            const hasRawChanged = sparkRawRatings[rating];
            const hasNoisedChanged = sparkNoisedRatings[rating];
            const sparkRawClass = hasRawChanged ? "sparkAnimation" : "";
            const sparkNoisedClass = hasNoisedChanged ? "sparkAnimation" : "";

            return (
                <>
                    <div key={`raw-${rating}`} className={`movie__ratingDistributionRow ${sparkRawClass}`}>
                        <span className="movie__ratingNumber">{rating}</span>
                        <div className="movie__ratingBar movie__ratingBar--raw" style={{ width: `${(count / maxCount) * 100}%` }} title={`Rating ${rating}: ${count}`}>
                            {count}
                        </div>
                    </div>
                    <div key={`noised-${rating}`} className={`movie__ratingDistributionRow movie__ratingDistributionRow--noised ${sparkNoisedClass}`}>
                        <span className="movie__ratingNumber">{rating}</span>
                        <div className="movie__ratingBar movie__ratingBar--noised" style={{ width: `${(noisedCount / maxCount) * 100}%` }} title={`Noised Rating ${rating}: ${noisedCount}`}>
                            {noisedCount}
                        </div>
                    </div>
                </>
            );
        });
    };

    // render bars in the same line
    // const renderRatingDistribution = () => {
    //     // Assuming the maximum count for scaling the bar sizes is needed from both distributions
    //     const maxCount = Math.max(
    //         ...Object.values(ratingDistribution),
    //         ...Object.values(noisedRatingDistribution)
    //     );

    //     return Object.entries(ratingDistribution).map(([rating, count]) => {
    //         const noisedCount = noisedRatingDistribution[rating] || 0;
    //         return (
    //             <div key={rating} className="movie__ratingDistributionRow">
    //                 <span className="movie__ratingNumber">{rating}</span>
    //                 <div className="movie__ratingBarsContainer">
    //                     <div className="movie__ratingBar" style={{ width: `${(count / maxCount) * 100}%` }} title={`Rating ${rating}: ${count}`}></div>
    //                     <div className="movie__ratingBar movie__ratingBar--noised" style={{ width: `${(noisedCount / maxCount) * 100}%` }} title={`Noised Rating ${rating}: ${noisedCount}`}></div>
    //                 </div>
    //                 <span className="movie__ratingCount">{count}</span>
    //                 <span className="movie__noisedRatingCount">{noisedCount}</span>
    //             </div>
    //         );
    //     });
    // };

    const calculateMean = (distribution) => {
        const total = Object.entries(distribution).reduce((acc, [rating, count]) => acc + (rating * count), 0);
        const count = Object.values(distribution).reduce((acc, count) => acc + count, 0);
        return total / count;
    };

    const calculateVariance = (distribution, mean) => {
        const variance = Object.entries(distribution).reduce((acc, [rating, count]) => {
            return acc + (count * (rating - mean) ** 2);
        }, 0);
        const count = Object.values(distribution).reduce((acc, count) => acc + count, 0);
        return variance / count;
    };

    const submitRating = () => {
        const payload = new FormData();
        payload.append('rating', newRating);
        payload.append('user_id', Math.floor(Math.random() * 1e8));

        fetch(`http://127.0.0.1:8000/v1/movie/${id % 50}/rate/`, {
            method: 'POST',
            body: payload,
        })
            .then(res => res.json())
            .then(data => {
                console.log("Rating submitted", data);
                getRatingDistribution(); // refresh
            })
            .catch(error => console.error("Error submitting rating", error));
    };

    const rawMean = calculateMean(ratingDistribution);
    const noisedMean = calculateMean(noisedRatingDistribution);
    const rawVariance = calculateVariance(ratingDistribution, rawMean);
    const noisedVariance = calculateVariance(noisedRatingDistribution, noisedMean);

    return (
        <div className="movie">
            <div className="movie__intro">
                <img className="movie__backdrop" src={`https://image.tmdb.org/t/p/original${currentMovieDetail ? currentMovieDetail.backdrop_path : ""}`} />
            </div>
            <div className="movie__detail">
                <div className="movie__detailLeft">
                    <div className="movie__posterBox">
                        <img className="movie__poster" src={`https://image.tmdb.org/t/p/original${currentMovieDetail ? currentMovieDetail.poster_path : ""}`} />
                    </div>
                </div>
                <div className="movie__detailRight">
                    <div className="movie__detailRightTop">
                        <div className="movie__name">{currentMovieDetail ? currentMovieDetail.original_title : ""}</div>
                        <div className="movie__tagline">{currentMovieDetail ? currentMovieDetail.tagline : ""}</div>
                        <div className="movie__rating">
                            {noisedMean.toFixed(2)} <i className="fas fa-star" />
                            <span className="movie__voteCount">{`(${Object.values(noisedRatingDistribution).reduce((acc, count) => acc + count, 0)} votes)`}</span>
                        </div>
                        <div className="movie__runtime">{currentMovieDetail ? currentMovieDetail.runtime + " mins" : ""}</div>
                        <div className="movie__releaseDate">{currentMovieDetail ? "Release date: " + currentMovieDetail.release_date : ""}</div>
                        <div className="movie__genres">
                            {
                                currentMovieDetail && currentMovieDetail.genres
                                    ?
                                    currentMovieDetail.genres.map(genre => (
                                        <><span className="movie__genre" id={genre.id}>{genre.name}</span></>
                                    ))
                                    :
                                    ""
                            }
                        </div>
                    </div>
                    <div className="movie__detailRightBottom">
                        <div className="synopsisText">Synopsis</div>
                        <div>{currentMovieDetail ? currentMovieDetail.overview : ""}</div>
                    </div>

                    <div className="movie__heading">Rating Distribution</div>
                    <div className="movie__ratingDistribution">
                        {renderRatingDistribution()}
                    </div>

                    <div className="movie__statistics">
                        <div>
                            <h3>Raw Data Statistics</h3>
                            <p>Mean: {rawMean.toFixed(2)}</p>
                            <p>Variance: {rawVariance.toFixed(2)}</p>
                        </div>
                        <div>
                            <h3>Noised Data Statistics</h3>
                            <p>Mean: {noisedMean.toFixed(2)}</p>
                            <p>Variance: {noisedVariance.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="movie__ratingInput">
                        <input
                            type="number"
                            value={newRating}
                            onChange={(e) => setNewRating(e.target.value)}
                            min="1"
                            max="5"
                        />
                        <button onClick={submitRating}>Submit Rating</button>
                    </div>

                </div>
            </div>
            <div className="movie__links">
                <div className="movie__heading">Useful Links</div>
                {
                    currentMovieDetail && currentMovieDetail.homepage && <a href={currentMovieDetail.homepage} target="_blank" style={{ textDecoration: "none" }}><p><span className="movie__homeButton movie__Button">Homepage <i className="newTab fas fa-external-link-alt"></i></span></p></a>
                }
                {
                    currentMovieDetail && currentMovieDetail.imdb_id && <a href={"https://www.imdb.com/title/" + currentMovieDetail.imdb_id} target="_blank" style={{ textDecoration: "none" }}><p><span className="movie__imdbButton movie__Button">IMDb<i className="newTab fas fa-external-link-alt"></i></span></p></a>
                }
            </div>
            <div className="movie__heading">Production companies</div>
            <div className="movie__production">
                {
                    currentMovieDetail && currentMovieDetail.production_companies && currentMovieDetail.production_companies.map(company => (
                        <>
                            {
                                company.logo_path
                                &&
                                <span className="productionCompanyImage">
                                    <img className="movie__productionComapany" src={"https://image.tmdb.org/t/p/original" + company.logo_path} />
                                    <span>{company.name}</span>
                                </span>
                            }
                        </>
                    ))
                }
            </div>
        </div>
    )
}

export default Movie