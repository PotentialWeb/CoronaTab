CoronaTab
======

Free & Open source platform for COVID19 data. Dashboard - REST API - Browser Extension - Localised into all languages!
 
![screenshot](https://user-images.githubusercontent.com/8472525/77709538-52ff7280-6fc3-11ea-84ca-a23b9b348b95.JPG)

[Website](https://coronatab.app) | [Dashboard](https://coronatab.app/dashboard) | [API Documentation](https://github.com/PotentialWeb/CoronaTab/wiki/RESTful-API-documentation)

## Data Sources
We use the [CoronaDataScraper](https://github.com/lazd/coronadatascraper) to pull data from official government sources and supplementing it with the [JHU Dataset](https://github.com/CSSEGISandData/COVID-19) 

## Contributing

### Adding Quick Links

* Edit [/site/public/data/quick-links.json](https://github.com/PotentialWeb/CoronaTab/blob/master/site/public/data/quick-links.json) , ensuring any new entries have at least an English title entry (`en`).
* Submit a PR

### Data

If you want to correct historic data for any place - go to [/modules/data/src/seeds/places/data.ts](https://github.com/PotentialWeb/CoronaTab/blob/master/modules/data/src/seeds/places/data.ts) find the data entry for the place and date you are interested in and change the value. Then submit a Pull Request!

If you would like to add new data sources please contribute to the [CoronaDataScraper](https://github.com/lazd/coronadatascraper) repository.


### Contributors

Made with ❤️, 🩸, 😰 and 😭 by the team at [Hoobu](https://hoobu.com).
