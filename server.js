const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const data = require("./data-service");
const bodyParser = require("body-parser");
const fs = require("fs");
const multer = require("multer");

const app = express();
dotenv.config();

// set HTTP_PORT
const HTTP_PORT = process.env.PORT || 8080;

// multer requires a few options to be setup to store files with file extensions
// by default it won't store extensions for security reasons
const storage = multer.diskStorage({
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    // we write the filename as the current date down to the millisecond
    // in a large web service this would possibly cause a problem if two people
    // uploaded an image at the exact same time. A better way would be to use GUID's for filenames.
    // this is a simple example.
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// tell multer to use the diskStorage function for naming files instead of the default.
const upload = multer({ storage: storage });

// set static folder
app.use(express.static(path.join(__dirname, "public")));

// body-parser configuration
app.use(bodyParser.urlencoded({ extended: true }));

// home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "home.html"));
});

// about route
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "about.html"));
});

// add image route
app.get("/images/add", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "addImage.html"));
});

// add employee route
app.get("/employees/add", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "addEmployee.html"));
});

// to get the image names as array (image route)
app.get("/images", (req, res) => {
  fs.readdir("./public/images/uploaded", function (err, items) {
    res.json({ images: items });
  });
});

// employees routes (with queries)
app.get("/employees", (req, res) => {
  if (req.query.status) {
    data
      .getEmployeesByStatus(req.query.status)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json({ message: "no results" });
      });
  } else if (req.query.department) {
    data
      .getEmployeesByDepartment(req.query.department)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json({ message: "no results" });
      });
  } else if (req.query.manager) {
    data
      .getEmployeesByManager(req.query.manager)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json({ message: "no results" });
      });
  } else {
    data
      .getAllEmployees()
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json({ message: "no results" });
      });
  }
});

// /employee/value route
app.get("/employee/:empNum", (req, res) => {
  data
    .getEmployeeByNum(req.params.empNum)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({ message: "no results" });
    });
});

// managers route
app.get("/managers", (req, res) => {
  data
    .getManagers()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({ message: "no results" });
    });
});

// departments route
app.get("/departments", (req, res) => {
  data
    .getDepartments()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({ message: "no results" });
    });
});

// form data (employee data) upload POST method
app.post("/employees/add", (req, res) => {
  data.addEmployee(req.body).then(() => {
    res.redirect("/employees");
  });
});

// image upload POST method
app.post("/images/add", upload.single("imageFile"), (req, res) => {
  res.redirect("/images");
});

// 404 error handler for undefined routes
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

// setup server
data
  .initialize()
  .then(function () {
    app.listen(HTTP_PORT, function () {
      console.log(`App listening on port: ${HTTP_PORT}`);
    });
  })
  .catch(function (err) {
    console.log(`Unable to start server: ${err}`);
  });
