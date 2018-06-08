"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var map_config_service_1 = require("../../../services/map-config.service");
var map_leaflet_service_1 = require("../../ui/leaflet/map-leaflet.service");
var Observable_1 = require("rxjs/Observable");
var http_1 = require("@angular/http");
var spatial_service_1 = require("../../../services/spatial.service");
var quick_search_service_1 = require("./quick-search.service");
var myGlobals = require("../../../globals");
// Import de nm-socle-application
var config_service_1 = require("../../../../../node_modules/nm-socle-application/app/services/config.service");
var geo_service_1 = require("../../../../../node_modules/nm-socle-application/app/services/geo.service");
var QuickSearchComponent = (function () {
    function QuickSearchComponent(_geoService, _mapConfigService, _mapLeafletService, _configService, _spatialService, _http, _quickSearchService) {
        this._geoService = _geoService;
        this._mapConfigService = _mapConfigService;
        this._mapLeafletService = _mapLeafletService;
        this._configService = _configService;
        this._spatialService = _spatialService;
        this._http = _http;
        this._quickSearchService = _quickSearchService;
        this._quickSearchQueryString = new forms_1.FormControl();
        this._quickSearchLoading = false;
        this._quickSearchHasInput = false;
        this._inputMinCharacterLength = 3;
    }
    QuickSearchComponent.prototype.ngOnInit = function () {
        this.subscribeInputChange();
    };
    QuickSearchComponent.prototype.subscribeInputChange = function () {
        var _this = this;
        this._inputChangeSubscription = this._quickSearchQueryString.valueChanges.debounceTime(700).subscribe(function (term) {
            _this._quickSearchResults = null;
            if (term.length > 0) {
                _this._quickSearchHasInput = true;
            }
            if (term.length >= _this._inputMinCharacterLength) {
                // Deux recherches en parallèle vers geoservice et un service externe
                var observableQueue = [];
                observableQueue.push(_this.requestExternalServiceQuickSearch(term));
                observableQueue.push(_this.requestGeoServiceQuickSearch(term));
                Observable_1.Observable.forkJoin(observableQueue).subscribe(function (result) {
                    _this._quickSearchResults = [];
                    // Résultats du service externe
                    var externalResult = result[0];
                    if (externalResult['features'] && externalResult['features'].length) {
                        for (var _i = 0, _a = externalResult['features']; _i < _a.length; _i++) {
                            var externalFeature = _a[_i];
                            _this._quickSearchResults.push({
                                id: externalFeature['properties']['id'],
                                label: externalFeature['properties']['label'],
                                geometry: externalFeature['geometry']
                            });
                        }
                    }
                    // Résultats geoservice
                    var internalResult = result[1];
                    if (internalResult) {
                        for (var i in internalResult) {
                            _this._quickSearchResults.push(internalResult[i]);
                        }
                    }
                    _this._quickSearchLoading = false;
                }, function (err) {
                    _this._quickSearchResults = null;
                    _this._quickSearchLoading = false;
                });
            }
        });
    };
    QuickSearchComponent.prototype.unsubscribeInputChange = function () {
        this._inputChangeSubscription.unsubscribe();
    };
    QuickSearchComponent.prototype.requestExternalServiceQuickSearch = function (quickSearchQueryString) {
        var _this = this;
        // Pour le moment la BANO est sélectionnée par défaut , peut-être paramétrage plus tard
        var mapCenter = this._mapLeafletService.map.getCenter();
        var params = new http_1.URLSearchParams();
        params.set('q', quickSearchQueryString);
        params.set('lat', mapCenter.lat);
        params.set('lng', mapCenter.lng);
        params.set('limit', '3');
        params.set('silentError', 'true');
        var uri = 'http://api-adresse.data.gouv.fr/search/?';
        uri += params.toString();
        return this._http.get(uri)
            .map(function (res) { return _this._geoService.extractData(res); })
            .catch(this.handleError.bind(this));
    };
    QuickSearchComponent.prototype.requestGeoServiceQuickSearch = function (quickSearchQueryString) {
        var _this = this;
        this._quickSearchLoading = true;
        var params = {
            mapId: this._mapConfigService.config['modelvueId'],
            searchString: quickSearchQueryString
        };
        return this._geoService.doRequestUriKey('nmaps_quick_search_uri', 'POST', undefined, undefined, params, undefined, "Recherche Rapide", "Chargement de la liste")
            .map(function (res) { return _this._geoService.extractData(res); })
            .catch(this.handleError.bind(this));
    };
    QuickSearchComponent.prototype.handleError = function (error) {
        var errMsg = 'Aucun résultat';
        return Observable_1.Observable.throw(errMsg);
    };
    QuickSearchComponent.prototype.clearResult = function () {
        this._quickSearchResults = null;
        this._quickSearchHasInput = false;
        this._quickSearchQueryString.setValue('');
        this._quickSearchService.currentSearchSelection = {};
        if (this._currentLayerSelection) {
            this._mapLeafletService.clearLayerSearchSelection(this._currentLayerSelection);
        }
    };
    QuickSearchComponent.prototype.selectResult = function (result) {
        var _this = this;
        // On désactive le subscriber le temps de remettre la valeur sélectionnée 
        this.unsubscribeInputChange();
        this._quickSearchQueryString.setValue(result.label);
        this.subscribeInputChange();
        if (result.layer) {
            var layerTripletInstance_1 = this._mapLeafletService.classInstance[result.layer];
            this._quickSearchService.currentSearchSelection["value"] = result;
            var uri = this._configService.get('nmaps_get_features_by_layer_and_ids_uri').value;
            this._geoService.doFeatureSelectRequest(uri, [result.id], result.layer, result.fieldName)
                .map(function (res) { return _this._geoService.extractData(res); })
                .catch(this._geoService.handleError.bind(this._geoService))
                .subscribe(function (feature) {
                // 1ère propriété est l'id 
                var geometry = feature['features'][0];
                // let id = geometry.properties[Object.keys(geometry.properties)[0]];
                // geometry.id = id;
                // Layer de sélection 
                _this._currentLayerSelection = result.layer;
                layerTripletInstance_1.featureLayer.setFeatureSearchSelection(feature['features']);
                _this._mapLeafletService.zoomOn(result.layer, geometry.id);
            });
        }
        else {
            this._mapLeafletService.zoomToFeature(result, '4326');
        }
    };
    return QuickSearchComponent;
}());
QuickSearchComponent = __decorate([
    core_1.Component({
        selector: 'my-quick-search',
        templateUrl: myGlobals.pathUi + 'quick-search/quick-search.component.html',
        styleUrls: [myGlobals.pathUi + 'quick-search/quick-search.component.css']
    }),
    __metadata("design:paramtypes", [geo_service_1.GeoServices,
        map_config_service_1.MapConfigService,
        map_leaflet_service_1.MapLeafletService,
        config_service_1.ConfigService,
        spatial_service_1.SpatialService,
        http_1.Http,
        quick_search_service_1.QuickSearchService])
], QuickSearchComponent);
exports.QuickSearchComponent = QuickSearchComponent;
//# sourceMappingURL=quick-search.component.js.map