var queryParams = {};
location.search.substr(1).split("&").forEach(function (item) {
    var parts = item.split("=");
    queryParams[parts[0]] = decodeURIComponent(parts[1]);
});

if (queryParams['t'] && queryParams['f']) {
    window.location.replace('/?t=' + encodeURIComponent(queryParams['t']) + '&f=' + encodeURIComponent(queryParams['f']));
}
