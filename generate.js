var AWS = require('aws-sdk'),
  fs = require('fs'),
  summary = require('geojson-summary'),
  queue = require('queue-async');

var s3bucket = new AWS.S3({
  params: {
    Bucket: 'geojson-xyz'
  }
});

var q = queue(1);

var categories = {
  water_oceans: /ocean/,
  water_lakes: /lakes/,
  water_other: /reefs|playas|coastline/,
  water_bathymetry: /bathymetry/,
  water_ice: /glaciated|ice/,
  political_countries: /countries/,
  political_states: /states/,
  political_boundaries: /boundary/,
  political_other: /admin/,
  people_areas: /areas/,
  people_transport: /airports|ports|roads/,
  land: /land/,
  parks: /parks/,
  graticules: /graticules/,
  misc: /.*/
};

function chooseCategory(key) {
  for (var category in categories) {
    if (key.match(categories[category])) {
      return category;
    }
  }
}

s3bucket.listObjects({
  Prefix: 'naturalearth-3.3.0'
}, function (err, res) {
  var contents = res.Contents;

  contents.forEach(function (object) {
    q.defer(s3bucket.getObject.bind(s3bucket), {
      Key: object.Key
    });
  });

  q.awaitAll(function(err, res) {
    var items = res.map(function(obj, i) {
      var name = contents[i].Key.replace('naturalearth-3.3.0/', '');
      return {
        size: contents[i].Size,
        name: name,
        url: 'http://geojson.xyz/' + contents[i].Key,
        summary: summary(JSON.parse(obj.Body)).sentence,
        category: chooseCategory(name)
      };
    }).sort(function(a, b) {
      return a.category > b.category;
    });
    fs.writeFileSync(
      './naturalearth-3.3.0/files.json',
      JSON.stringify(items, null, 2));
  });
});
