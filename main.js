
import { cars, upgrades } from "./cars.js";
import { Garage } from "./garage.js";
import { Race } from "./race.js";
import { ThreeScene } from "./three-scene.js";

console.log("DRAG RACING BRASIL carregado!");

const $ = selector => document.querySelector(selector);

const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".nav-btn");

let scene3D = null;
let race = null;
let currentCategory = "Todos";

// ==================================
// GARAGEM
// ==================================

const garage = new Garage(() => {
    renderAll();

    if (scene3D) {
        scene3D.changeCar();
    }
});

// ==================================
// CRÉDITOS
// ==================================

function updateCredits() {
    $("#credits").textContent =
        "R$ " + garage.credits.toLocaleString("pt-BR");
}

// ==================================
// INICIALIZAÇÃO DA PISTA 3D
// ==================================

function initializeRace() {
    if (!scene3D) {
        const container = $("#three-container");

        scene3D = new ThreeScene(container, garage);

        race = new Race(
            garage,
            scene3D,
            updateDashboard
        );
    }

    requestAnimationFrame(() => {
        scene3D.resize();
    });
}

// ==================================
// NAVEGAÇÃO
// ==================================

function changeScreen(screenName) {
    const target = document.getElementById(screenName);

    if (!target) {
        console.error("Tela não encontrada:", screenName);
        return;
    }

    screens.forEach(screen => {
        screen.classList.remove("active");
    });

    navButtons.forEach(button => {
        button.classList.remove("active");
    });

    target.classList.add("active");

    const activeButton = document.querySelector(
        `.nav-btn[data-screen="${screenName}"]`
    );

    if (activeButton) {
        activeButton.classList.add("active");
    }

    if (screenName === "race") {
        initializeRace();
    }

    if (screenName === "garage") {
        garage.renderGarage($("#garage-list"));
    }

    if (screenName === "catalog") {
        garage.renderCatalog(
            $("#catalog-list"),
            currentCategory
        );
    }

    if (screenName === "tuning") {
        renderTuning();
    }

    if (screenName === "compare") {
        renderCompareOptions();
    }
}

navButtons.forEach(button => {
    button.addEventListener("click", () => {
        changeScreen(button.dataset.screen);
    });
});

document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
        changeScreen(button.dataset.go);
    });
});

// ==================================
// CATÁLOGO E GARAGEM
// ==================================

function renderAll() {
    updateCredits();

    garage.renderGarage($("#garage-list"));

    garage.renderCatalog(
        $("#catalog-list"),
        currentCategory
    );

    renderCompareOptions();
    renderTuning();
}

// Filtros do catálogo
document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        currentCategory = button.dataset.category;

        garage.renderCatalog(
            $("#catalog-list"),
            currentCategory
        );
    });
});

// Comprar e selecionar veículos
document.addEventListener("click", event => {
    const buyButton = event.target.closest("[data-buy-car]");
    const selectButton = event.target.closest("[data-select-car]");

    if (buyButton) {
        const id = Number(buyButton.dataset.buyCar);

        if (garage.buy(id)) {
            alert("Veículo comprado com sucesso!");

            garage.select(id);
            changeScreen("garage");
        }
    }

    if (selectButton) {
        const id = Number(selectButton.dataset.selectCar);

        if (garage.select(id)) {
            alert("Veículo selecionado!");

            if (scene3D) {
                scene3D.changeCar();
            }

            renderAll();
        }
    }
});

// ==================================
// PAINEL DA CORRIDA
// ==================================

function updateDashboard() {
    if (!race) return;

    $("#speed").textContent = Math.round(race.speed);
    $("#rpm").textContent = Math.round(race.rpm);
    $("#gear").textContent = race.gear;
    $("#distance").textContent =
        Math.floor(race.distance) + " m";

    $("#time").textContent =
        race.elapsed.toFixed(2) + " s";

    const status = $("#race-status");

    if (race.status === "idle") {
        status.textContent = "AGUARDANDO LARGADA";
    }

    if (race.status === "running") {
        status.textContent = "CORRIDA EM ANDAMENTO";
    }

    if (race.status === "finished") {
        status.textContent = "CHEGADA! VOCÊ COMPLETOU 402 METROS!";
    }
}

// ==================================
// BOTÕES DA CORRIDA
// ==================================

$("#start-race").addEventListener("click", () => {
    initializeRace();

    if (race.status !== "running") {
        race.start();
        $("#race-status").textContent = "VALENDO! ACELERE!";
    }
});

$("#reset-race").addEventListener("click", () => {
    if (!race) return;

    race.reset();
    updateDashboard();
});

// ==================================
// ACELERADOR E FREIO
// ==================================

function gasOn() {
    if (!race) initializeRace();
    race.setThrottle(true);
}

function gasOff() {
    if (race) race.setThrottle(false);
}

function brakeOn() {
    if (race) race.setBrake(true);
}

function brakeOff() {
    if (race) race.setBrake(false);
}

const mobileGas = $("#mobile-gas");
const mobileBrake = $("#mobile-brake");

mobileGas.addEventListener("pointerdown", event => {
    event.preventDefault();
    gasOn();
});

mobileGas.addEventListener("pointerup", gasOff);
mobileGas.addEventListener("pointerleave", gasOff);
mobileGas.addEventListener("pointercancel", gasOff);

mobileBrake.addEventListener("pointerdown", event => {
    event.preventDefault();
    brakeOn();
});

mobileBrake.addEventListener("pointerup", brakeOff);
mobileBrake.addEventListener("pointerleave", brakeOff);
mobileBrake.addEventListener("pointercancel", brakeOff);

// Teclado
document.addEventListener("keydown", event => {
    if (event.code === "Space" || event.code === "KeyW") {
        event.preventDefault();

        if (!event.repeat && $("#race").classList.contains("active")) {
            gasOn();
        }
    }

    if (event.code === "KeyS" || event.code === "ArrowDown") {
        if ($("#race").classList.contains("active")) {
            brakeOn();
        }
    }
});

document.addEventListener("keyup", event => {
    if (event.code === "Space" || event.code === "KeyW") {
        gasOff();
    }

    if (event.code === "KeyS" || event.code === "ArrowDown") {
        brakeOff();
    }
});

window.addEventListener("blur", () => {
    gasOff();
    brakeOff();
});

// ==================================
// COMPARAÇÃO DE VEÍCULOS
// ==================================

function renderCompareOptions() {
    const selectA = $("#compare-a");
    const selectB = $("#compare-b");

    if (!selectA || !selectB) return;

    const previousA = selectA.value;
    const previousB = selectB.value;

    const options = cars.map(car => {
        return `
            <option value="${car.id}">
                ${car.name}
            </option>
        `;
    }).join("");

    selectA.innerHTML = options;
    selectB.innerHTML = options;

    selectA.value = previousA || "1";
    selectB.value = previousB || "2";
}

$("#compare-button").addEventListener("click", () => {
    const carA = cars.find(
        car => car.id === Number($("#compare-a").value)
    );

    const carB = cars.find(
        car => car.id === Number($("#compare-b").value)
    );

    if (!carA || !carB) return;

    const result = $("#compare-result");

    result.innerHTML = `
        <h2>${carA.name} X ${carB.name}</h2>

        <div class="spec-grid">
            <div>
                <small>${carA.name} — POTÊNCIA</small>
                <b>${carA.power} cv</b>
            </div>

            <div>
                <small>${carB.name} — POTÊNCIA</small>
                <b>${carB.power} cv</b>
            </div>

            <div>
                <small>${carA.name} — VELOCIDADE</small>
                <b>${carA.maxSpeed} km/h</b>
            </div>

            <div>
                <small>${carB.name} — VELOCIDADE</small>
                <b>${carB.maxSpeed} km/h</b>
            </div>
        </div>

        <p>
            Maior potência:
            <strong>
                ${carA.power >= carB.power ? carA.name : carB.name}
            </strong>
        </p>

        <p>
            Maior velocidade:
            <strong>
                ${carA.maxSpeed >= carB.maxSpeed ? carA.name : carB.name}
            </strong>
        </p>
    `;
});

// ==================================
// PREPARAÇÃO DOS VEÍCULOS
// ==================================

function renderTuning() {
    const container = $("#tuning-content");

    if (!container) return;

    const installed = garage.getSelectedUpgrades();

    const stats = garage.getSelectedStats();

    container.innerHTML = `
        <div class="panel">
            <h2>${garage.selectedCar.name}</h2>

            <p>Potência atual: <strong>${stats.power} cv</strong></p>

            <p>Velocidade máxima: <strong>${stats.maxSpeed} km/h</strong></p>

            <p>Créditos disponíveis:
                <strong>R$ ${garage.credits.toLocaleString("pt-BR")}</strong>
            </p>
        </div>

        <h2>MELHORIAS DISPONÍVEIS</h2>

        <div class="car-grid">
            ${upgrades.map(upgrade => {
                const alreadyInstalled = installed.includes(upgrade.id);

                return `
                    <article class="car-card">
                        <div class="car-info">
                            <h3>${upgrade.name}</h3>

                            <p>${upgrade.description}</p>

                            <p>
                                Potência adicional:
                                <strong>+${upgrade.power} cv</strong>
                            </p>

                            <p>
                                Preço:
                                <strong>
                                    R$ ${upgrade.price.toLocaleString("pt-BR")}
                                </strong>
                            </p>

                            <button class="card-btn"
                                data-upgrade="${upgrade.id}"
                                ${alreadyInstalled ? "disabled" : ""}>
                                ${alreadyInstalled ? "INSTALADO" : "INSTALAR"}
                            </button>
                        </div>
                    </article>
                `;
            }).join("")}
        </div>
    `;
}

document.addEventListener("click", event => {
    const button = event.target.closest("[data-upgrade]");

    if (!button) return;

    const upgrade = upgrades.find(
        item => item.id === button.dataset.upgrade
    );

    if (upgrade && garage.installUpgrade(upgrade)) {
        alert("Melhoria instalada com sucesso!");

        renderAll();
    }
});

// ==================================
// INÍCIO DO JOGO
// ==================================

renderAll();
updateDashboard();

console.log("Sistemas do jogo inicializados!");
