import Express = require('express');
import * as multer from 'multer'
import { Module } from "../Module";
import { Picnic } from "../../models/Picnic";

export class DataModule extends Module {
  addRoutes(app: Express.Application) {
    // Tables
    app.post('/data/tables/find/within', multer().single(), function (req: Express.Request, res: Express.Response) {
      let bounds = req.body;
      Picnic.find({}).where("geometry").within(bounds).lean().exec().then(function (tables: any) {
        res.send(tables);
      });
    });
    app.post('/data/tables/add', function (req: Express.Request, res: Express.Response) {
      let fields = req.body;

      let table = new Picnic({
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [Number(fields.longitude), Number(fields.latitude)]
        },
        "properties": {
          "type": "table",
          "comment": fields.comment,
          "license": {
            "url": fields.license_url,
            "name": fields.license_name
          },
          "source": {
            "url": fields.source_url,
            "name": fields.source_name,
            "retrieved": Date.now()
          }
        }
      });

      switch (fields.sheltered.toLowerCase()) {
        case "yes":
          table.properties.sheltered = true;
          break;
        case "no":
          table.properties.sheltered = false;
          break;
      };

      switch (fields.accessible.toLowerCase()) {
        case "yes":
          table.properties.accessible = true;
          break;
        case "no":
          table.properties.accessible = false;
          break;
      }

      Picnic.create(table, function (error: any, tables: string) {
        if (error) {
          res.send("We had an error... " + error);
          console.log(error);
        } else {
          console.log(tables);
          res.redirect(req.header('Referer'));
        }
      });
    });
  }
}
