import _ from "underscore";
import { View } from "backbone.marionette";
import { CountryModel } from "Models/country";
import { CountryHelpersCollection } from "Collections/countryHelpers";
import template from "./country.hbs";

export class CountryView extends View {
  constructor(options={}) {
    _.defaults(options, {
      className: "content-inner",
      template,
      events: {
        "click #submit": "onSubmit",
      },
    });
    super(options);

    this.loading = true;
    this.countries = new CountryHelpersCollection();
    this.countries.fetch({
      success: () => {
        this.loading = false;
        this.render();
      }
    });
  }

  serializeData() {
    return {
      loading: this.loading,
      countries: this.countries.toJSON(),
    };
  }

  onSubmit() {
    const $form = this.$el.find("form");
    const helperId = $form.serializeArray()[0].value;
    this.countries.get(helperId).fetch({
      success: model => {
        (new CountryModel()).save({
          name: model.get("name"),
          geometry: model.get("geometry"),
        }, {
          success: () => {
            this.triggerMethod("refresh:map", this);
            this.triggerMethod("close:menu", this);
          }
        });
      }
    });
  }
}
