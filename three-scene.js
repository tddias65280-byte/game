
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export class ThreeScene {
    constructor(container, garage) {
        this.container = container;
        this.garage = garage;
        this.scene = new THREE.Scene();

        this.scene.background = new THREE.Color(0x101722);
        this.scene.fog = new THREE.Fog(0x101722, 45, 130);

        this.camera = new THREE.PerspectiveCamera(
            48,
            1,
            0.1,
            1000
        );

        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        this.renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        );

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.innerHTML = "";
        this.container.appendChild(this.renderer.domElement);

        this.scene.add(
            new THREE.HemisphereLight(0xffffff, 0x343434, 2)
        );

        const sunlight = new THREE.DirectionalLight(0xffffff, 2.5);
        sunlight.position.set(-10, 20, 15);
        sunlight.castShadow = true;
        this.scene.add(sunlight);

        this.createTrack();
        this.createCar();

        this.camera.position.set(-5, 5, 16);
        this.camera.lookAt(3, 1, 0);

        this.resizeObserver = new ResizeObserver(() => {
            this.resize();
        });

        this.resizeObserver.observe(this.container);

        this.resize();
        this.animate();
    }

    createTrack() {
        // Gramado ao redor da pista
        const grass = new THREE.Mesh(
            new THREE.PlaneGeometry(700, 120),
            new THREE.MeshStandardMaterial({
                color: 0x243c2a
            })
        );

        grass.rotation.x = -Math.PI / 2;
        grass.position.y = -0.2;
        this.scene.add(grass);

        // Asfalto da pista
        const asphalt = new THREE.Mesh(
            new THREE.BoxGeometry(650, 0.2, 19),
            new THREE.MeshStandardMaterial({
                color: 0x20242a,
                roughness: 0.9
            })
        );

        asphalt.position.set(20, -0.08, 0);
        asphalt.receiveShadow = true;
        this.scene.add(asphalt);

        // Linhas das duas faixas
        const lineMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff
        });

        [-8.5, 0, 8.5].forEach(z => {
            const line = new THREE.Mesh(
                new THREE.BoxGeometry(650, 0.025, 0.12),
                lineMaterial
            );

            line.position.set(20, 0.04, z);
            this.scene.add(line);
        });

        // Marcas no asfalto
        for (let x = -10; x < 340; x += 12) {
            const mark = new THREE.Mesh(
                new THREE.BoxGeometry(4, 0.025, 0.15),
                new THREE.MeshBasicMaterial({
                    color: 0xffd34f
                })
            );

            mark.position.set(x, 0.045, 0);
            this.scene.add(mark);
        }

        // Barreiras laterais
        [-10, 10].forEach(z => {
            const barrier = new THREE.Mesh(
                new THREE.BoxGeometry(650, 0.9, 0.5),
                new THREE.MeshStandardMaterial({
                    color: 0xd52d35
                })
            );

            barrier.position.set(20, 0.4, z);
            this.scene.add(barrier);

            // Faixa branca na barreira
            for (let x = -280; x < 340; x += 8) {
                const stripe = new THREE.Mesh(
                    new THREE.BoxGeometry(3, 0.92, 0.53),
                    new THREE.MeshBasicMaterial({
                        color: 0xffffff
                    })
                );

                stripe.position.set(x, 0.4, z);
                this.scene.add(stripe);
            }
        });

        // Linha de largada
        const startLine = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.04, 18),
            new THREE.MeshBasicMaterial({
                color: 0xffffff
            })
        );

        startLine.position.set(0, 0.06, 0);
        this.scene.add(startLine);

        // Linha de chegada dos 402 metros
        const finishLine = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.05, 18),
            new THREE.MeshBasicMaterial({
                color: 0xffffff
            })
        );

        finishLine.position.set(48.24, 0.07, 0);
        this.scene.add(finishLine);

        // Placa da chegada
        const finishPost = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 5, 0.5),
            new THREE.MeshStandardMaterial({
                color: 0xffbd4a
            })
        );

        finishPost.position.set(48.24, 2.5, -10.5);
        this.scene.add(finishPost);

        // Árvore de largada
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.09, 0.09, 4, 12),
            new THREE.MeshStandardMaterial({
                color: 0xcccccc
            })
        );

        pole.position.set(-3, 2, -9);
        this.scene.add(pole);

        const lightColors = [
            0xff3333,
            0xff3333,
            0xffbd4a,
            0xffbd4a,
            0x32dd72
        ];

        lightColors.forEach((color, index) => {
            const lamp = new THREE.Mesh(
                new THREE.SphereGeometry(0.22, 16, 16),
                new THREE.MeshBasicMaterial({ color })
            );

            lamp.position.set(-3, 3.5 - index * 0.65, -8.7);
            this.scene.add(lamp);
        });

        // Estruturas de arquibancada ao longo da pista
        for (let x = 5; x < 90; x += 20) {
            this.createStand(x, -15);
            this.createStand(x, 15);
        }

        // Iluminação lateral
        for (let x = -5; x < 100; x += 18) {
            const post = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 7, 8),
                new THREE.MeshStandardMaterial({
                    color: 0x777777
                })
            );

            post.position.set(x, 3.5, 13);
            this.scene.add(post);

            const lamp = new THREE.PointLight(
                0xffffff,
                25,
                18
            );

            lamp.position.set(x, 7, 13);
            this.scene.add(lamp);
        }
    }

    createStand(x, z) {
        const stand = new THREE.Mesh(
            new THREE.BoxGeometry(12, 3, 3),
            new THREE.MeshStandardMaterial({
                color: 0x29394b
            })
        );

        stand.position.set(x, 1.5, z);
        this.scene.add(stand);

        const seats = [0xed353c, 0xffbd4a, 0xffffff];

        for (let i = 0; i < 12; i++) {
            const person = new THREE.Mesh(
                new THREE.BoxGeometry(0.35, 0.65, 0.35),
                new THREE.MeshStandardMaterial({
                    color: seats[i % seats.length]
                })
            );

            person.position.set(
                x - 5 + (i % 6) * 2,
                3.4,
                z
            );

            this.scene.add(person);
        }
    }

    createCar() {
        this.carGroup = new THREE.Group();
        this.wheels = [];

        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: this.garage.selectedCar.color,
            metalness: 0.5,
            roughness: 0.35
        });

        const body = new THREE.Mesh(
            new THREE.BoxGeometry(3.4, 0.65, 1.35),
            bodyMaterial
        );

        body.position.y = 0.85;
        body.castShadow = true;
        this.carGroup.add(body);

        const cabin = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 0.7, 1.15),
            new THREE.MeshStandardMaterial({
                color: 0x252b36,
                metalness: 0.3
            })
        );

        cabin.position.set(-0.1, 1.45, 0);
        cabin.castShadow = true;
        this.carGroup.add(cabin);

        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0x80a9c5,
            metalness: 0.7,
            roughness: 0.2
        });

        const windowMesh = new THREE.Mesh(
            new THREE.BoxGeometry(1.35, 0.4, 1.17),
            windowMaterial
        );

        windowMesh.position.set(-0.1, 1.48, 0);
        this.carGroup.add(windowMesh);

        const wheelMaterial = new THREE.MeshStandardMaterial({
            color: 0x080808,
            roughness: 0.95
        });

        const rimMaterial = new THREE.MeshStandardMaterial({
            color: 0xb9bec7,
            metalness: 0.9
        });

        [-1.1, 1.1].forEach(x => {
            [-0.73, 0.73].forEach(z => {
                const wheel = new THREE.Group();

                const tire = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.43, 0.43, 0.22, 24),
                    wheelMaterial
                );

                tire.rotation.x = Math.PI / 2;
                wheel.add(tire);

                const rim = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.2, 0.2, 0.24, 16),
                    rimMaterial
                );

                rim.rotation.x = Math.PI / 2;
                wheel.add(rim);

                wheel.position.set(x, 0.55, z);

                this.carGroup.add(wheel);
                this.wheels.push(wheel);
            });
        });

        this.carGroup.position.set(0, 0, -4);
        this.scene.add(this.carGroup);
    }

    updateCar(speed, distance) {
        // 402 metros correspondem a aproximadamente 48 unidades 3D
        const x = distance * 0.12;

        this.carGroup.position.x = x;

        // A câmera acompanha o carro
        this.camera.position.x = x - 5;
        this.camera.lookAt(x + 2, 1, -1);

        // Rodas giram de acordo com a velocidade
        this.wheels.forEach(wheel => {
            wheel.rotation.z -= speed * 0.003;
        });
    }

    updateCarColor() {
        const car = this.garage.selectedCar;

        this.carGroup.children[0].material.color.setHex(car.color);
    }

    changeCar() {
        this.updateCarColor();
    }

    resetCar() {
        this.carGroup.position.x = 0;

        this.camera.position.x = -5;
        this.camera.lookAt(2, 1, -1);

        this.wheels.forEach(wheel => {
            wheel.rotation.z = 0;
        });
    }

    resize() {
        const width = Math.max(1, this.container.clientWidth);
        const height = Math.max(1, this.container.clientHeight);

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.renderer.render(this.scene, this.camera);
    }
}
