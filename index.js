const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const Json2csvParser = require('json2csv').Parser;

const URLS = [
    'https://www.imdb.com/title/tt0102926/?ref_=nv_sr_1', 
    'https://www.imdb.com/title/tt2267998/?ref_=nv_sr_1'
];

(async () => {
    let moviesData = [];

    for(let movie of URLS) {
        const response = await request({
                uri: movie,
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
                    'Cache-Control': 'max-age=0',
                    'Connection': 'keep-alive',
                    'Host': 'www.imdb.com',
                    'Upgrade-Insecure-Requests': '1',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
                },
                gzip: true
            }
        );

        let $ = cheerio.load(response);
           
        let title = $('div[class="title_wrapper"] > h1').text().trim();
        let rating = $('div[class="ratingValue"] > strong > span').text();
        let poster = $('div[class="poster"] > a > img').attr('src');
        let totalRatings = $('div[class="imdbRating"] > a').text();
        let releaseDate = $('a[title="See more release dates"]').text().trim();
        let popularity = $('#title-overview-widget > div.plot_summary_wrapper > div.titleReviewBar > div:nth-child(5) > div.titleReviewBarSubItem > div:nth-child(2) > span').text().trim();
        let genres = [];

        $('div[class="title_wrapper"] a[href^="/genre/"]').each((i, elm) => {
            let genre = $(elm).text();
            
            genres.push(genre);
        });
        
        moviesData.push({
            title,
            rating,
            poster,
            totalRatings,
            releaseDate,
            genres
        });
        
    }


    const json2csvParser = new Json2csvParser();
    const csv = json2csvParser.parse(moviesData);

    fs.writeFileSync('./data.csv', csv, 'utf-8');
    console.log(csv);

})()