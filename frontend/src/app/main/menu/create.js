import Bb from 'backbone'
import { View } from 'backbone.marionette'
import fetch from '../../utils'
import template from './create.hbs'

export default View.extend({
  template: template,

  model: new Bb.Model({
    isCountry: true
  }),

  ui: {
    choose: '.choose',
    country: '#country',
    name: '#name',
    description: '#description',
    place: '#place',
    submit: '#submit',
  },

  events: {
    'click @ui.choose': 'onChoose',
    'click @ui.place': 'onPlace',
    'click @ui.submit': 'onSubmit',
  },

  initialize(drawPoint) {
    this.drawPoint = drawPoint
    this.model.on('change', this.render, this)
    this.loadCountries()
  },

  onChoose(e) {
    this.model.set('isCountry', false)
    this.model.set('isCity', false)
    this.model.set('isCapital', false)

    switch (e.target.dataset.choose) {
      case 'country':
        this.model.set('isCountry', true)
        break;
      case 'city':
        this.model.set('isCity', true)
        break;
      case 'capital':
        this.model.set('isCapital', true)
        break;
    }

    this.loadCountries()
  },

  onPlace() {
    this.drawPoint(this.model)
  },

  onSubmit() {
    if (this.model.get('isCountry'))
      this.onSubmitCountry()
    else if (this.model.get('isCity'))
      this.onSubmitCity()
    else if (this.model.get('isCapital'))
      this.onSubmitCapital()
  },

  onSubmitCountry() {
    const id = this.getUI('country').val()
    const itemId = this.getUI('country').prop('selectedIndex')
    const name = this.getUI('country').prop('options').item(itemId).text

    const url = 'api/geo/countries/' + id + '/'
    fetch('GET', url)
    .then(res => res.json())
    .then(data => {
      fetch('POST', 'api/geo/country/', JSON.stringify({
        name,
        geometry: data.geometry,
      }))
      .then(res => {
        if (res.ok) {
          this.triggerMethod('refresh:map', this)
          this.loadCountries()
        }
      })
    })
  },

  onSubmitCity() {
    const name = this.getUI('name').val()
    const country = this.getUI('country').val()
    const description = this.getUI('description').val()
    const geometry = {
      type: 'Point',
      coordinates: this.model.get('coords')
    }

    fetch('POST', 'api/geo/city/', JSON.stringify({
      name,
      country,
      description,
      geometry,
      image_set: [],
    }))
    .then(res => {
      if (res.ok) {
        this.triggerMethod('refresh:map', this)
        this.triggerMethod('close:menu', this)
      }
    })
  },

  onSubmitCapital() {

  },

  loadCountries() {
    if (this.model.get('isCountry'))
      fetch('GET', 'api/geo/countries/')
      .then(res => res.json())
      .then(data => this.model.set('countries', data))
    else
      fetch('GET', 'api/geo/search/country/')
      .then(res => res.json())
      .then(data => this.model.set('countries', data))
  },
})
