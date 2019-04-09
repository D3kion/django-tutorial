import Bb from 'backbone'
import { View } from 'backbone.marionette'
import fetch from '../utils'
import template from './template.hbs'
import MapView from './map'
import MenuView from './menu/view'
import FeatureView from './menu/feature'
import CreateView from './menu/create'
import EditCityView from './menu/editCity'
import SearchView from './menu/search'

export default View.extend({
  template: template,

  model: new Bb.Model(),

  ui: {
    layers: '#layers',
    create: '#create',
    homeExtent: '#home-extent',
    logout: '#logout',
    search: '#search',
  },

  events: {
    'click @ui.layers': 'openLayers',
    'click @ui.create': 'openCreate',
    'click @ui.homeExtent': 'onHomeExtent',
    'click @ui.logout': 'onLogout',
    'keyup @ui.search': 'searchFeature',
  },

  childViewEvents: {
    'close:menu': 'closeMenu',
    'open:feature': 'openFeature',
    'open:feature:id': 'openFeatureById',
    'edit:feature:city': 'editCity',
    'refresh:map': 'refreshMap',
  },

  initialize() {
    this.addRegions({
      menu: {
        el: '#menu-placeholder',
        replaceElement: true,
      },
      map: {
        el: '#map-placeholder',
        replaceElement: true,
      },
    })

    this.model.on('change', this.render, this)
    this.getUsername()
  },
  
  onRender() {
    this.map = new MapView()
    this.showChildView('map', this.map)
  },

  showMenu(view) {
    this.showChildView('menu', new MenuView({ contentView: view }))
  },
  
  openLayers() {
    this.showMenu()
  },

  openCreate() {
    this.showMenu(new CreateView(this.map.drawPoint.bind(this.map)))
  },

  onHomeExtent() {
    this.map.homeExtent()
  },

  onLogout() {
    localStorage.removeItem('token')
    location.reload()
  },

  searchFeature(e) {
    if (e.keyCode == 13)
      this.showMenu(new SearchView(e.target.value))
  },

  closeMenu() {
    this.getRegion('menu').empty()
    this.map.select.getFeatures().clear()
  },

  openFeature(view, feature) {
    if (typeof feature !== 'undefined') {
      const type = feature.getGeometry().constructor.name === 'Point' ? 'city' : 'country'    
      this.showMenu(new FeatureView(type, feature.getId()))
    } else {
      this.closeMenu()
    }
  },

  openFeatureById(view, feature) {
    const type = Object.entries(feature)[0][0]
    const id = Object.entries(feature)[0][1]

    this.showMenu(new FeatureView(type, id))
    
    this.map.select.getFeatures().clear()
    this.map.select.getFeatures().push(this.getFeature(type, id))
  },

  editCity(view, id) {
    this.showMenu(new EditCityView(id))
  },
  
  refreshMap() {
    this.map.loadLayers()
  },

  getUsername() {
    fetch('GET', 'api/token-info/')
    .then(res => res.json())
    .then(data => this.model.set('name', data.user))
  },

  getFeature(type, id) {
    if (type == 'city')
      return this.map.cityLayer.getSource().getFeatureById(id)
    else
      return this.map.countryLayer.getSource().getFeatureById(id)
  }
})
