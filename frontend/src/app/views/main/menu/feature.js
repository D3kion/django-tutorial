import "bootstrap/js/dist/modal";
import "bootstrap/js/dist/carousel";
import "bootstrap/js/dist/tooltip";
import _ from "underscore";
import { View } from "backbone.marionette";
import { CountryModel } from "Models/country";
import { CityModel } from "Models/city";
import countryTemplate from "./featureCountry.hbs";
import cityTemplate from "./featureCity.hbs";

import "Views/hbsHelpers";

export class FeatureView extends View {
  constructor(type, id, options={}) {
    _.defaults(options, {
      className: "content-inner",
      template: type === "country" ? countryTemplate : cityTemplate,
      events: {
        "click .clickable": "openFeature",
        "click #edit": "editFeature",
        "click #delete": "deleteFeature",
        // city
        "click .cimg": "openCarousel",
      },
      ui: {
        delete: "#delete",
        imgModal: "#imgModal",
      }
    });
    super(options);

    this.loading = true;
    this.featureType = type;
    this.modalImage = null;
    this.delete = false;

    if (type === "country") 
      this.feature = new CountryModel();
    else
      this.feature = new CityModel();

    this.feature.set({id}).fetch({
      success: () => {
        this.loading = false;
        this.render();
      }
    });
  }

  serializeData() {
    return {
      loading: this.loading,
      feature: this.feature.toJSON(),
      modalImage: this.modalImage,
    };
  }

  onDestroy() {
    if (!_.isUndefined(this.deleteBtn))
      this.deleteBtn.tooltip("dispose");
  }

  openFeature(e) {
    this.triggerMethod("open:feature:id", this, e.target.dataset);
  }

  editFeature() {
    if (this.featureType === "country")
      this.triggerMethod("edit:feature:country", this, this.feature);
    else
      this.triggerMethod("edit:feature:city", this, this.feature);
  }

  deleteFeature() {
    this.deleteBtn = this.getUI("delete");
    if (!this.delete) {
      this.delete = true;
      this.deleteBtn.attr("title", "Нажмите еще раз, чтобы удалить.");
      this.deleteBtn.tooltip({
        placement: "right",
        trigger: "manual",
      });
      this.deleteBtn.tooltip("show");
    } else {
      this.feature.destroy({
        success: () => {
          this.triggerMethod("refresh:map", this);
          this.triggerMethod("close:menu", this);
        }
      });
      this.deleteBtn.tooltip("dispose");
    }
  }

  openCarousel(e) {
    this.modalImage = e.target.dataset.id;
    this.render();

    const modal = this.getUI("imgModal");
    modal.modal({
      backdrop: false,
    }).modal("show");
  }
}
