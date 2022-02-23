(function (){
    document.head.innerHTML = `    <meta charset="UTF-8">
        <title>Swagger UI</title>
        <link rel="stylesheet" type="text/css" href="https://petstore.swagger.io/swagger-ui.css" >
        <link rel="icon" type="image/png" href="https://petstore.swagger.io/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="https://petstore.swagger.io/favicon-16x16.png" sizes="16x16" />
        <style>
          html
          {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
          }

          *,
          *:before,
          *:after
          {
            box-sizing: inherit;
          }

          body
          {
            margin:0;
            background: #fafafa;
          }
        </style>`;
    document.body.innerHTML = '<div id="swagger-ui"></div>';
    var script = document.body.appendChild(document.createElement("script"));
    script.src = "https://petstore.swagger.io/swagger-ui-bundle.js";
    script.onload = function () {
        var script = document.body.appendChild(document.createElement("script"));
        script.src = "https://petstore.swagger.io/swagger-ui-standalone-preset.js";
        script.onload = function () {
            // Begin Swagger UI call region
            const ui = SwaggerUIBundle({
                "dom_id": "#swagger-ui",
                deepLinking: true,
                presets: [
                  SwaggerUIBundle.presets.apis,
                  SwaggerUIStandalonePreset
                ],
                plugins: [
                  SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                validatorUrl: "https://validator.swagger.io/validator",
                url: "https://raw.githubusercontent.com/gabrielsroka/oktasdk-java/patch-4/src/swagger/api.yaml"
            });
            // End Swagger UI call region

            window.ui = ui
        };
    };
})();