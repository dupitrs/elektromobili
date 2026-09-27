import { gardenRoutes, hedgeContours } from "./years-routes.js";

self.onmessage = ({ data: { width, depth, offset } }) => {
  self.postMessage(hedgeContours(gardenRoutes().roads, offset, width, depth));
};
