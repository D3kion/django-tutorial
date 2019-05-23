import _ from "underscore";
import { View } from "backbone.marionette";
import { CapitalModel } from "Models/capital";
import template from "./editCountry.hbs";

export class EditCountryView extends View {
  constructor(feature, options={}) {
    _.defaults(options, {
      className: "content-inner",
      template,
      events: {
        "click #submit": "onSubmit",
      },
      ui: {
        form: "form",
      }
    });
    super(options);

    this.feature = feature.clone();
    if (this.feature.get("capital") !== null)
      this.capital = (new CapitalModel()).set({
          id: this.feature.get("capital").capital_id,
          capital_of: this.feature.id,
      });
  }

  serializeData() {
    return {
      feature: this.feature.toJSON(),
      cities: this.feature.get("cities").filter(x => {
        if (this.feature.get("capital") !== null)
          return x.id !== this.feature.get("capital").id;
      }),
    };
  }

  onSubmit() {
    const $form = this.getUI("form");
    let data = {};
    $form.serializeArray().map(x => data[x.name] = x.value);

    this.capital.save({
      city: data.capital,
    }, {
      success: () => {
        this.triggerMethod("refresh:map", this, "country");
        this.triggerMethod("close:menu", this);
      }
    });
  }
}
