
export class Race {
    constructor(garage, scene, onUpdate) {
        this.garage = garage;
        this.scene = scene;
        this.onUpdate = onUpdate;

        this.status = "idle";
        this.speed = 0;
        this.rpm = 900;
        this.gear = "N";
        this.distance = 0;
        this.elapsed = 0;

        this.throttle = false;
        this.brake = false;

        // Sistema NOS
        this.nosActive = false;
        this.nosRemaining = 0;
        this.nosCooldown = 0;
        this.nosDuration = 4;
        this.nosRecharge = 8;

        this.lastTime = 0;
        this.frame = null;

        this.nosButton = document.getElementById("nos-button");

        this.nosButton?.addEventListener("click", () => {
            this.activateNOS();
        });

        this.tick = this.tick.bind(this);
        this.updateNOSButton();
    }

    start() {
        if (this.status === "running") return;

        this.status = "running";
        this.speed = 0;
        this.distance = 0;
        this.elapsed = 0;
        this.rpm = 900;
        this.gear = 1;

        this.throttle = false;
        this.brake = false;

        this.nosActive = false;
        this.nosRemaining = 0;
        this.nosCooldown = 0;

        this.lastTime = performance.now();

        this.scene?.resetCar();
        this.onUpdate?.();
        this.updateNOSButton();

        if (!this.frame) {
            this.frame = requestAnimationFrame(this.tick);
        }
    }

    setThrottle(value) {
        this.throttle = value;

        if (value && this.status !== "running") {
            this.start();
            this.throttle = true;
        }
    }

    setBrake(value) {
        this.brake = value;
    }

    activateNOS() {
        if (this.status !== "running") {
            this.nosButton.textContent = "INICIE A CORRIDA!";
            return;
        }

        if (this.nosActive || this.nosCooldown > 0) return;

        this.nosActive = true;
        this.nosRemaining = this.nosDuration;

        this.updateNOSButton();
    }

    updateNOSButton() {
        if (!this.nosButton) return;

        if (this.nosActive) {
            this.nosButton.textContent =
                "🔥 NOS ATIVADO!";
            this.nosButton.disabled = true;
        } else if (this.nosCooldown > 0) {
            this.nosButton.textContent =
                "RECARREGANDO NOS...";
            this.nosButton.disabled = true;
        } else {
            this.nosButton.textContent =
                "🔥 ATIVAR TURBO NOS";
            this.nosButton.disabled = false;
        }
    }

    reset() {
        this.status = "idle";

        this.speed = 0;
        this.rpm = 900;
        this.gear = "N";
        this.distance = 0;
        this.elapsed = 0;

        this.throttle = false;
        this.brake = false;

        this.nosActive = false;
        this.nosRemaining = 0;
        this.nosCooldown = 0;

        if (this.frame) {
            cancelAnimationFrame(this.frame);
            this.frame = null;
        }

        this.scene?.resetCar();
        this.onUpdate?.();
        this.updateNOSButton();
    }

    tick(now) {
        if (this.status !== "running") {
            this.frame = null;
            return;
        }

        const delta = Math.min(
            (now - this.lastTime) / 1000,
            0.05
        );

        this.lastTime = now;

        const stats = this.garage.getSelectedStats();

        // Controle do nitro
        if (this.nosActive) {
            this.nosRemaining -= delta;

            if (this.nosRemaining <= 0) {
                this.nosRemaining = 0;
                this.nosActive = false;
                this.nosCooldown = this.nosRecharge;
            }
        } else if (this.nosCooldown > 0) {
            this.nosCooldown = Math.max(
                0,
                this.nosCooldown - delta
            );
        }

        // Potência extra do NOS
        const nosMultiplier = this.nosActive ? 2.2 : 1;

        // Aceleração
        if (this.throttle) {
            const powerRatio = stats.power / stats.weight;

            const launchBoost = this.speed < 60 ? 1.5 : 1;

            const acceleration =
                powerRatio * 300 *
                launchBoost *
                nosMultiplier;

            this.speed += acceleration * delta;
        } else {
            this.speed -= 12 * delta;
        }

        // Freio
        if (this.brake) {
            this.speed -= 75 * delta;
        }

        // Velocidade máxima com NOS
        const maxSpeed = stats.maxSpeed *
            (this.nosActive ? 1.35 : 1);

        this.speed = Math.max(
            0,
            Math.min(this.speed, maxSpeed)
        );

        // Distância
        this.distance +=
            (this.speed / 3.6) * delta;

        this.elapsed += delta;

        // RPM
        const ratio = this.speed / Math.max(1, maxSpeed);

        this.rpm = Math.round(900 + ratio * 6200);

        // Marchas
        if (this.speed < 1) {
            this.gear = "N";
        } else if (this.speed < 60) {
            this.gear = 1;
        } else if (this.speed < 110) {
            this.gear = 2;
        } else if (this.speed < 160) {
            this.gear = 3;
        } else if (this.speed < 210) {
            this.gear = 4;
        } else {
            this.gear = 5;
        }

        // Chegada
        if (this.distance >= 402) {
            this.distance = 402;
            this.status = "finished";

            this.throttle = false;
            this.brake = false;
            this.speed = 0;
            this.nosActive = false;

            this.garage.credits += 2500;
            this.garage.update();
        }

        this.scene?.updateCar(this.speed, this.distance);

        this.onUpdate?.();
        this.updateNOSButton();

        if (this.status === "running") {
            this.frame = requestAnimationFrame(this.tick);
        } else {
            this.frame = null;
        }
    }
}
