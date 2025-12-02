fetch('data.json')
.then(response => {
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
})
.then(data => {
  var elem = document.getElementsByTagName("BODY")[0];

  function openFullscreen() {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  }

  $(document).ready(function() {
    $('body').on('click', 'button, .hamburger-menu', function() {
      openFullscreen();
    });

    function sanitizeIngredient(str) {
      return str.toLowerCase()
        .replace(/\b(topped with|top with|drops|dashes|dash|muddled|float|floated|half|splash|pinch|or|to taste|to|top|few|rinse|fill|as needed|ea|garnish(ed)?( with)?)\b/g, '')
        .replace(/\d+(\.\d+)?\s*(oz|ml|tsp|tbsp|teaspoon|tablespoon|parts)?/gi, '')
        .replace(/\(.*?\)/g, '')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function toCamelCase(str) {
      return str.toLowerCase().split(' ').map(function(word, index) {
        return index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
      }).join('');
    }

    function toTitleCase(str) {
      return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1));
    }

    function initialize() {
      d3.select("body").append("div").attr("id", "menu");
      d3.select("#menu").append("h1").attr("class", "menu-sections").attr("id", "drinksSection").text("Drinks");
      d3.select("#menu").append("h1").attr("class", "menu-sections").attr("id", "shotsSection").text("Shots");
      d3.select("#menu").append("h1").attr("class", "menu-sections").attr("id", "favoritesSection").text("Favorites");
      d3.select("#menu").append("h1").attr("class", "menu-sections").attr("id", "batchRecipesSection").text("Batch Recipes");
      d3.select("#menu").append("h1").attr("class", "menu-sections").attr("id", "inventorySection").text("Inventory");
      d3.select("#menu").append("h1").attr("class", "menu-sections").attr("id", "sectionSetupSection").text("Section Setup");
      d3.select("#menu").append("h1").attr("class", "menu-sections").attr("id", "settingsSection").text("Settings");
      d3.select("#menu").append("h1").attr("class", "menu-sections").attr("id", "qrCodeSection").text("QR Code");
      d3.select("body").append("div").attr("id", "topNav");
      d3.select("#topNav").append("div").attr("id", "hamburgerMenu").attr("class", "hamburger-menu").html(`<div class="bar"></div><div class="bar"></div><div class="bar"></div>`);
      d3.select("#topNav").append("button").text("Menu  Cocktails").attr("class", "button nav-buttons").attr("id", "cocktails");
      d3.select("#topNav").append("button").text("Retired Recipes").attr("class", "button nav-buttons retired").attr("id", "originals");
      d3.select("body").append("div").attr("id", "mainContainer");
      d3.select("body").append("div").attr("id", "bottomNav");
      d3.select("#bottomNav").append("button").text("Search Drinks / Often Called").attr("class", "button nav-buttons").attr("id", "searchDrinks");
    }

    initialize();

    // Show/hide menu on hamburger click
    $('body').on('click', '.hamburger-menu', function(event) {
      event.stopPropagation();
      $('#menu').toggle();
    });

    // Hide menu if clicking outside
    $(document).on('click', function(event) {
      const isClickInsideMenu = $(event.target).closest('#menu, .hamburger-menu').length > 0;
      if (!isClickInsideMenu && $('#menu').is(':visible')) {
        $('#menu').hide();
      }
    });

    $('body').on('click', '#drinksSection', function(event) {
      $('#menu').hide();
      $("#mainContainer").empty();

      const scrollContainer = d3.select("#mainContainer").append("div").attr("id", "scrollContainer").style("max-height", "90vh").style("overflow-y", "auto");
      scrollContainer.append("ul").attr("id", "drinkList").style("list-style-type", "none").style("padding", "0").style("margin", "0");

      let sortedDrinks = [...drinkInfo].sort((a, b) => a.name.localeCompare(b.name));
      let sortedLetters = [...new Set(sortedDrinks.map(d => d.name.charAt(0).toUpperCase()))];

      d3.select("#drinkList")
        .insert("div", ":first-child")
        .attr("id", "alphabetNav")
        .style("display", "flex")
        .style("justify-content", "space-around")
        .style("padding", "10px 0")
        .style("background", "#1a1a1a")
        .style("color", "white")
        .style("width", "95%")
        .style("margin", "0 auto")
        .style("position", "sticky")
        .style("top", "0")
        .style("z-index", "999")
        .style("border-bottom", "1px solid #444");

      sortedLetters.forEach(letter => {
        d3.select("#alphabetNav")
          .append("span")
          .attr("class", "alpha-link")
          .attr("data-letter", letter)
          .text(letter)
          .style("cursor", "pointer")
          .style("font-weight", "bold");
      });

      let currentLetter = "";
      sortedDrinks.forEach(drink => {
        const firstLetter = drink.name.charAt(0).toUpperCase();
        if (firstLetter !== currentLetter) {
          currentLetter = firstLetter;
          d3.select("#drinkList")
            .append("li")
            .attr("class", "letter-header")
            .attr("id", `letter-${currentLetter}`)
            .style("fontWeight", "bold")
            .style("fontSize", "1.3em")
            .style("margin-top", "1em")
            .style("color", "#ffd700")
            .text(currentLetter);
        }
        d3.select("#drinkList")
          .append("li")
          .attr("class", "drink-list")
          .attr("id", drink.name)
          .style("cursor", "pointer")
          .style("padding", "5px 0")
          .text(drink.name)
          .on("click", () => {
            $(`.drink-buttons#${CSS.escape(drink.name)}`).trigger("click");
          });
      });
    });

    $('body').on('click', '.alpha-link', function() {
      const target = $(this).attr('data-letter');
      if (!target) return;
      const targetElem = $(`#letter-${target}`);
      if (targetElem.length) {
        const container = document.getElementById("scrollContainer");
        container.scrollTo({
          top: targetElem.position().top + container.scrollTop - 250,
          behavior: "smooth"
        });
      }
    });

    $('body').on('click', '#shotsSection, #favoritesSection, #settingsSection', function(event) {
      $('#menu').hide();
      $("#mainContainer").empty();
      d3.select("#mainContainer").append("h1").attr("class", "under-construction").text("...Under Construction...");
    });


    $('body').on('click', '#batchRecipesSection', function(event) {
    $('#menu').hide();
    $("#mainContainer").empty();

    // Filter drinks that are in the "cocktails" section AND have a batch or alt. batch
    const cocktailsWithBatch = drinkInfo.filter(drink => 
        drink.section === "cocktails" &&
        ((drink.batch && drink.batch.length > 0) || 
        (drink["alt. batch"] && drink["alt. batch"].length > 0))
    );

    if (cocktailsWithBatch.length === 0) {
        d3.select("#mainContainer")
          .append("p")
          .text("No batch recipes available for cocktails.")
          .style("font-size", "3vh")
          .style("text-align", "center")
          .style("width", "100%");
        return;
    }

    // Create container for all batch cards
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexWrap = "wrap";
    container.style.justifyContent = "center";
    container.style.alignItems = "flex-start";
    container.style.width = "100%";
    container.style.padding = "2%";
    $("#mainContainer").append(container);

    cocktailsWithBatch.forEach(drink => {
        // Main batch card
        if (drink.batch && drink.batch.length > 0) {
            const card = document.createElement("div");
            card.classList.add("batch-cards");

            const title = document.createElement("h2");
            title.textContent = `${drink.name} ( Batch )`;
            card.appendChild(title);

            const ul = document.createElement("ul");
            drink.batch.forEach(recipe => {
                const li = document.createElement("li");
                li.textContent = recipe;
                ul.appendChild(li);
            });
            card.appendChild(ul);
            container.appendChild(card);
        }

        // Alt batch card
        if (drink["alt. batch"] && drink["alt. batch"].length > 0) {
            const altCard = document.createElement("div");
            altCard.classList.add("batch-cards");

            const altTitle = document.createElement("h2");
            altTitle.textContent = `${drink.name} ( Alt Batch )`;
            altCard.appendChild(altTitle);

            const ulAlt = document.createElement("ul");
            drink["alt. batch"].forEach(step => {
                const li = document.createElement("li");
                li.textContent = step;
                ulAlt.appendChild(li);
            });
            altCard.appendChild(ulAlt);
            container.appendChild(altCard);
        }
    });
});





    $('body').on('click', '#inventorySection', function(event) {
      window.open("https://projectdg.github.io/PJKInventory/", "_blank");
    });

    $('body').on('click', '#sectionSetupSection', function(event) {
      window.open("https://projectdg.github.io/PJKv4SectionSetup/", "_blank");
    });

    $('body').on('click', '#qrCodeSection', function(event) { 
      $('#menu').hide();
      $("#mainContainer").empty();
      d3.select("#mainContainer").append("div").attr("id", "qrDiv");
      d3.select("#qrDiv").append("h1").attr("id", "qrTitle").text("Scan for link to this website");
      d3.select("#qrDiv").append("div").attr("id", "qrImgDiv");
      d3.select("#qrImgDiv").append("img").attr("src", "./images/qrCode.jpg").attr("id", "qrCode");
    });

    let drinkInfo = data[0].drinks;
    let style = "color: yellow;"
    let finalDrinkCount = drinkInfo.length - 22;
    console.log("%cThere are currently " + drinkInfo.length + " recipes in your database. Less 22 house recipes is: " + finalDrinkCount, style);

    // Flatten inventory structure
    let inventoryRaw = data[0].inventory;
    let inventoryItems = [];
    let missingItems = [];

    inventoryRaw.forEach(group => {
      if (group.category === "Missing Ingredients") {
        group.items.forEach(item => missingItems.push(item));
      } else {
        group.items.forEach(item => inventoryItems.push(item));
      }
    });

    const allInventoryItems = inventoryItems.concat(missingItems);

    const inventoryNamesCamel = inventoryItems.map(i => toCamelCase(sanitizeIngredient(i.name)));
    const missingItemNamesCamel = missingItems.map(i => toCamelCase(sanitizeIngredient(i.name)));

    function renderDrinkButton(drink, containerSelector) {
      let missingItemsFound = [];

      Object.keys(drink).forEach(key => {
        if (["wine", "liquor", "liqueur", "vermouth", "mixers"].includes(key) && Array.isArray(drink[key])) {
          const missing = drink[key].filter(item => {
            const normalizedItem = toCamelCase(sanitizeIngredient(item));
            return !inventoryNamesCamel.includes(normalizedItem);
          });
          missingItemsFound = missingItemsFound.concat(missing);
        }
      });

      const button = d3.select(containerSelector)
        .append("button")
        .text(drink.name)
        .attr("class", "button drink-buttons")
        .attr("id", drink.name);

      if (missingItemsFound.length > 0) {
        button.classed("missing", true);
      }

      const strippedMissing = missingItemsFound.map(item => sanitizeIngredient(item));
      console.log(`${drink.name} missing:`, strippedMissing);
    }

    function createButtons(navID) {
      drinkInfo.forEach(drink => {
        if (navID !== drink.section && !(navID === "searchDrinks" && drink.section === "searchDrinks")) return;

        const container = navID === "searchDrinks" ? "#searchListDiv" : "#mainContainer";
        renderDrinkButton(drink, container);
      });
    }

    createButtons("cocktails");

    $('body').on('click', '#cocktails, #originals', function() {
      $("#mainContainer").empty();
      console.clear();
      console.log("%cThere are currently " + drinkInfo.length + " drinks in your database.", style);
      createButtons(this.id);
    });

    $('#searchDrinks').on('click', function() {
      $("#mainContainer").empty();
      console.clear();
      console.log("%cThere are currently " + drinkInfo.length + " drinks in your database.", style);
      d3.select("#mainContainer").append("div").attr("id", "searchDiv");
      d3.select("#searchDiv").append("input").attr("id", "searchInput").attr("placeholder", "search...");
      d3.select("#searchDiv").append("button").attr("id", "clearButton").text("Clear");
      d3.select("#mainContainer").append("div").attr("id", "searchListDiv");
      createButtons(this.id);
    });

    $('body').on('click', '.drink-buttons, .drink-list', function() {
      $("#mainContainer").empty();
      const drinkID = this.id;
      const drink = drinkInfo.find(x => x.name === drinkID);
      if (!drink) return;

      d3.select("#mainContainer").append("div").attr("id", "drinkInfoContainer");
      d3.select("#drinkInfoContainer").append("div").attr("id", "cardTitle").text(drink.name);
      d3.select("#drinkInfoContainer").append("div").attr("id", "drinkInfo");
      d3.select("#drinkInfo").append("div").attr("class", "info-divs").attr("id", "drinkPhoto");

      if (drink.photo !== null) {
        d3.select("#drinkPhoto").append("img").attr("class", "drink-photo").attr("src", "./images/" + drink.photo + ".png");
      } else {
        d3.select("#drinkPhoto").append("p").text("Please Upload Photo").style("color", "antiquewhite").style("font-size", "3vh").style("margin", "4%");
      }

      d3.select("#drinkInfo").append("div").attr("class", "info-divs").attr("id", "drinkRecipeDiv");
      d3.select("#drinkInfo").append("div").attr("class", "info-divs").attr("id", "drinkInstructionsDiv");

      Object.keys(drink).forEach(key => {
        if (["instructions", "batch", "alt. batch"/*, "alt. batch 2"*/].includes(key) && drink[key] !== null) {
          d3.select("#drinkInstructionsDiv").append("div").attr("class", "instructions-title").attr("id", "drinkInstructionsTitle").text(key.toUpperCase());
          drink[key].forEach(instruction => {
            d3.select("#drinkInstructionsDiv").append("li").attr("class", "instructions").text(instruction);
          });
        }

        if (["name", "section", "photo", "instructions", "batch", "alt. batch"].includes(key)) return;

        if (drink[key] !== null) {
          d3.select("#drinkRecipeDiv").append("div").attr("class", "recipe-div").attr("id", key + "Title");
          d3.select("#" + key + "Title").append("div").attr("class", "recipe-title-div").attr("id", key);
          d3.select("#" + key).append("p").attr("class", "recipe-title").text(key.toUpperCase() + ":");
          d3.select("#" + key).append("div").attr("class", "drink-recipe").attr("id", key + "Recipe");

          drink[key].forEach(val => {
            const sanitized = toCamelCase(sanitizeIngredient(val));
            const isMissing = !inventoryNamesCamel.includes(sanitized);

            d3.select("#" + key + "Recipe")
              .append("p")
              .attr("id", val)
              .attr("class", "recipe")
              .style("color", key !== "glass" && key !== "garnish" && isMissing ? "red" : null)
              .text(val);
          });
        }
      });
    });

    document.addEventListener("input", (e) => {
      console.clear();
      console.log("%cThere are currently " + drinkInfo.length + " drinks in your database.", style);
      let value = e.target.value;
      if (value && value.trim().length > 0) {
        value = value.trim().toLowerCase().replace(/[^\w\s]/gi, "");
        $("#searchListDiv").empty();
        let filteredDrinks = drinkInfo.filter(x => x.name.toLowerCase().replace(/[^\w\s]/gi, "").includes(value));

        if (filteredDrinks.length > 0) {
          filteredDrinks.forEach(x => {
            renderDrinkButton(x, "#searchListDiv");
          });
        } else {
          d3.select("#searchListDiv")
            .append("p")
            .text("...No drinks found...")
            .attr("class", "error-message");
        }
      } else {
        $("#searchListDiv").empty();
        drinkInfo.forEach(x => {
          if (x.section === "searchDrinks") {
            renderDrinkButton(x, "#searchListDiv");
          }
        });
      }
    });

    $('body').on('click', '#clearButton', function() {
      console.clear();
      console.log("%cThere are currently " + drinkInfo.length + " drinks in your database.", style);
      $("#searchInput").val("");
      $("#searchListDiv").empty();
      const searchDrinks = drinkInfo.filter(drink => drink.section === "searchDrinks");
      searchDrinks.forEach(drink => {
        renderDrinkButton(drink, "#searchListDiv");
      });
    });

    $('body').on("click", ".recipe", function () {
      const parentId = $(this).closest(".drink-recipe").attr("id");
      const ignoredCategories = ["glassRecipe", "garnishRecipe", /*"mixersRecipe"*/];
      if (ignoredCategories.includes(parentId)) return;

      const clickedIngredient = this.id;
      const sanitizedClicked = sanitizeIngredient(clickedIngredient);
      const camelClicked = toCamelCase(sanitizedClicked);

      let matchedItem = null;
      let matchedData = null;

      for (let i of allInventoryItems) {
        const sanitizedInventory = sanitizeIngredient(i.name);
        const camelInventory = toCamelCase(sanitizedInventory);
        if (camelInventory === camelClicked) {
          matchedItem = i.name;
          matchedData = i;
          break;
        }

      }

      const itemName = toTitleCase(matchedItem || sanitizeIngredient(clickedIngredient));

      d3.select("body").append("div").attr("id", "modalBG");

      const modal = d3.select("#modalBG")
        .append("div")
        .attr("id", "modalContent")
        .attr("class", "modal-content");

      const modalTitleDiv = d3.select(".modal-content")
        .append("div")
        .attr("id", "modalTitleDiv")
        .attr("class", "modal-title-div");

      modalTitleDiv.append("h2").attr("class", "modal-title").text(itemName);

      const modalFlex = modal.append("div").attr("class", "modal-flex");

      modalFlex.append("img")
        .attr("class", "modal-image")
        .attr("src", "./images/" + camelClicked + ".png")
        .on("error", function () {
          d3.select(this).attr("src", "./images/placeholder.png");
        });

      const modalRight = modalFlex.append("div").attr("class", "modal-right");

      const altDiv = modalRight.append("div").attr("class", "modal-alternatives");
      altDiv.append("p").attr("class", "modal-alt-title").text("Similar or Alternative Options:");
      const altList = altDiv.append("ul").attr("class", "modal-alt-list");

      if (matchedData?.alternatives?.length > 0) {
        altList.selectAll("li").data(matchedData.alternatives).enter().append("li").attr("class", "modal-li").text(d => d);
      } else {
        altList.append("li").text("No alternatives available.");
      }

      const descDiv = modalRight.append("div").attr("class", "modal-alternatives");
      descDiv.append("p").attr("class", "modal-alt-title").text("Description:");
      const descList = descDiv.append("ul").attr("class", "modal-alt-list");

      if (matchedData?.description?.length > 0) {
        descList.selectAll("li").data(matchedData.description).enter().append("li").attr("class", "modal-li").text(d => d);
      } else {
        descList.append("li").text("No description available.");
      }
    });

    $('body').on('click', '#modalBG', function() {
      $("#modalBG").remove();
    });

  });
})
.catch(error => {
  console.error('There was a problem fetching the mainSections:', error);
});
