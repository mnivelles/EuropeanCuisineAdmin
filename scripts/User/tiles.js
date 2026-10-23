import { Header } from "/scripts/Common/Header.js";
import { Components } from "/scripts/Common/Components.js";
import { SEGMENTS } from "/scripts/Common/Routes.js";

Header.render();

const mainTabView = document.getElementById("mainTabView");
const selectedSegment = "tiles";
Components.addSegmentedControlIn(mainTabView, SEGMENTS.users, selectedSegment);
