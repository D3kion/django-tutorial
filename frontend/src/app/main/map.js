import 'ol/ol.css'
import * as proj from 'ol/proj'
import { Map, View } from 'ol'
import OSM from 'ol/source/OSM'
import Vector from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import Select from 'ol/interaction/Select.js'
import { never } from 'ol/events/condition'
import { View as MnView } from 'backbone.marionette'
import template from './map.hbs'

export default MnView.extend({
  template: template,
  
  initialize() {
    this.initLayers()
    this.map = new Map({
      layers: [this.mainLayer, this.countryLayer, this.cityLayer],
      view: new View({
        center: proj.transform([39, 47], 'EPSG:4326', 'EPSG:3857'),
        zoom: 4,
      }),
      controls: [],
    })

    this.select = new Select({
      toggleCondition: never
    })
    this.map.addInteraction(this.select)
    this.select.on('select', this.onSelect.bind(this))
  },

  onDomRefresh() {
    this.map.setTarget('map')
  },

  onSelect(e) {
    const feature = e.target.getFeatures().getArray()[0]
    this.triggerMethod('open:feature', this, feature)
  },

  homeExtent() {
    this.map.setView(new View({
      center: proj.transform([39, 47], 'EPSG:4326', 'EPSG:3857'),
      zoom: 4,
    }))
  },

  initLayers() {
    const url = 'http://' + location.hostname + ':8000/api/geo/geojson/'

    let countrySource = new Vector({
      format: new GeoJSON({
        defaultDataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      }),
      loader: function() {
        fetch(url + 'country/', {
          method: 'GET',
          headers: {
            'Authorization': 'Token ' + localStorage.token
          }
        }).then(res => res.json())
          .then(data => {
            countrySource.addFeatures(
              countrySource.getFormat().readFeatures(data))
          })
      }
    })
    
    let citySource = new Vector({
      format: new GeoJSON({
        defaultDataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      }),
      loader: function() {
        fetch(url + 'city/', {
          method: 'GET',
          headers: {
            'Authorization': 'Token ' + localStorage.token
          }
        }).then(res => res.json())
          .then(data => {
            citySource.addFeatures(
              citySource.getFormat().readFeatures(data))
          })
      }
    })

    this.mainLayer = new TileLayer({
      source: new OSM(),
    })
    
    this.countryLayer = new VectorLayer({
      source: countrySource
    })
    
    this.cityLayer = new VectorLayer({
      source: citySource
    })
  },
})
