const requestPromise = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const Json2csvParser = require('json2csv').Parser;
const request = require('request');

const URLS = [
    {
url:'https://www.imdb.com/title/tt0111161/?pf_rd_m=A2FGELUUNOQJNL&pf_rd_p=e31d89dd-322d-4646-8962-327b42fe94b1&pf_rd_r=5MFAZZS1R7W4HT4MNKSZ&pf_rd_s=center-1&pf_rd_t=15506&pf_rd_i=top&ref_=chttp_tt_1',
id:'The_Shawshank_Redemption'
}, 
    {
url:'https://www.imdb.com/title/tt0050083/?pf_rd_m=A2FGELUUNOQJNL&pf_rd_p=e31d89dd-322d-4646-8962-327b42fe94b1&pf_rd_r=5MFAZZS1R7W4HT4MNKSZ&pf_rd_s=center-1&pf_rd_t=15506&pf_rd_i=top&ref_=chttp_tt_5',
id:'12_Angry_Men'
},
    {
url:'https://www.imdb.com/title/tt0068646/?pf_rd_m=A2FGELUUNOQJNL&pf_rd_p=e31d89dd-322d-4646-8962-327b42fe94b1&pf_rd_r=5MFAZZS1R7W4HT4MNKSZ&pf_rd_s=center-1&pf_rd_t=15506&pf_rd_i=top&ref_=chttp_tt_2',
id:'The_Godfather'
}
];

(async () => { 
    let moviesData = [];

    for(let movie of URLS) {
        const response = await requestPromise({
                uri: movie.url,
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

        $('div[class="title_bar_wrapper"] a[href^="/search/"]').each((i, elm) => {
            let genre = $(elm).text();
            
            genres.push(genre);
        });
        
        moviesData.push({
            title,
            rating,
            poster,
            totalRatings,
            releaseDate,
            genres,
            popularity
        });
    
        let file = fs.createWriteStream(`./posters/${movie.id}.jpg`);
         
        //for poster

        await new Promise((resolve,reject)=>{
        let stream = request({
            uri:poster,
            headers:{
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
                    'Cache-Control': 'max-age=0',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
                    },
                    gzip:true
        })
        .pipe(file)  
        .on('finish',()=>{

        console.log(`${movie.id}  poster is downloaded`);
        resolve();
    })
    .on('error',(error)=>{ 
        reject(error);
    })
    })
     .catch(error=>{
        console.log(`${movie.id}has error on download ${error}`) ;
     
    });
}
    //for csv file
    const json2csvParser = new Json2csvParser();
    const csv = json2csvParser.parse(moviesData);

    fs.writeFileSync('./data/data.csv', csv, 'utf-8');
    console.log("Downloaded data succesfully");
    console.log("Hurray!!!");

})()
