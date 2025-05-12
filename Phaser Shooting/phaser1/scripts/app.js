var config = {
    type: Phaser.AUTO,
    width: 500,
    height: 888,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

let background;
let cursors;
let timerText;
let bullets;
let spaceKey;
let isGameFrozen = false;

function preload () {
    // AUDIO
    this.load.audio("bgm", "../phaser1/assets/music/bgm.mp3");
    this.load.audio("gun", "../phaser1/assets/music/gun.mp3");
    this.load.audio("win", "../phaser1/assets/music/win.mp3");
    this.load.audio("lose", "../phaser1/assets/music/lose.mp3");
    this.load.audio("explode", "../phaser1/assets/music/explode.mp3");

    // IMAGE
    this.load.image("background", "../phaser1/assets/image/background.jpg");
    this.load.image("jet", "../phaser1/assets/image/jet.png");
    this.load.image("rock", "../phaser1/assets/image/rock.png");
    this.load.image("bullet", "../phaser1/assets/image/bullet.png");
    this.load.image("dude", "../phaser1/assets/image/dude.png");
}

function create () {

    this.bgm = this.sound.add("bgm", { loop: true, volume: 0.5 });
    this.bgm.play();

    isGameFrozen = false;
    let timeLeft = 120;
    let currentRockSpeed = 100;
    let rockSpeedIncreaseRate = 2;

    background = this.add.tileSprite(0, 0, config.width, config.height, "background").setOrigin(0, 0);

    // JEEETTTTT
    this.jet = this.physics.add.sprite(230, 800, 'jet');
    this.jet.setCollideWorldBounds(true);
    this.jet.body.allowGravity = false;
    this.jet.body.setSize(50, 80).setOffset(66, 10);

    cursors = this.input.keyboard.createCursorKeys();
    spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.rocks = this.physics.add.group();
    bullets = this.physics.add.group();

    let statusText = this.add.text(config.width / 2, config.height / 2, '', {
        font: "48px Arial",
        fill: "#ffffff"
    }).setOrigin(0.5);
    statusText.setAlpha(0); 

   // ROOOCCKKKKK
this.rockTimer = this.time.addEvent({
    delay: 1500,
    callback: () => {
        if (isGameFrozen) return;

  
        for (let i = 0; i < 5; i++) {
            const delay = Phaser.Math.Between(0, 500); 
            this.time.delayedCall(delay, () => {
                const x = Phaser.Math.Between(50, 450);
                const rock = this.rocks.create(x, -50, 'rock');
                rock.hp = 3;
                rock.setVelocityY(currentRockSpeed);
                rock.setVelocityX(Phaser.Math.Between(-150, 150));
                rock.setAngularVelocity(Phaser.Math.Between(-200, 200));
                rock.setCollideWorldBounds(false);
                rock.setBounce(0);
            });
        }
    },
    loop: true
    });

    this.physics.add.overlap(bullets, this.rocks, (bullet, rock) => {
        bullet.destroy();
        rock.hp--;
        if (rock.hp <= 0) {
            rock.destroy();
           
            this.sound.play("explode", { volume: 0.5 });
        }
    }, null, this);

    this.physics.add.overlap(this.jet, this.rocks, () => {
        if (isGameFrozen) return;
        isGameFrozen = true;

        this.jet.setTint(0xff0000);
        this.jet.setActive(false);
        this.jet.setVisible(false);
        this.jet.body.velocity.x = 0;

        this.rocks.children.iterate((rock) => {
            rock.setVelocity(0);
            rock.setAngularVelocity(0);
            rock.body.allowGravity = false;
        });

        bullets.children.iterate((bullet) => {
            bullet.setVelocity(0);
        });

        statusText.setText("Game Over");
        statusText.setColor("#FF0000"); 
        statusText.setAlpha(1);


        this.bgm.stop();
        this.sound.play("lose", { volume: 0.5 });

        this.time.delayedCall(3000, () => {
            this.scene.restart();
        });
    }, null, this);

    // TIIMEEERRRRR
    timerText = this.add.text(10, 10, "Time: 2:00", {
        font: "24px Arial",
        fill: "#ffffff"
    });
    
    this.time.addEvent({
        delay: 1000,
        callback: () => {
            if (isGameFrozen) return;

            timeLeft--;
            currentRockSpeed += rockSpeedIncreaseRate;

            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            timerText.setText(`Time: ${minutes}:${seconds < 10 ? "0" + seconds : seconds}`);

            if (timeLeft <= 0) {
                isGameFrozen = true;

                this.jet.setActive(false);
                this.jet.setVisible(false);
                this.rocks.children.iterate((rock) => {
                    rock.setVelocity(0);
                    rock.setAngularVelocity(0);
                    rock.body.allowGravity = false;
                });
                bullets.children.iterate((bullet) => {
                    bullet.setVelocity(0);
                });

                statusText.setText("You Win");
                statusText.setColor("#00FF00"); 
                statusText.setAlpha(1);

                this.bgm.stop();
                this.sound.play("win", { volume: 0.5 });
                
                this.time.delayedCall(3000, () => {
              
                    if (!this.bgm.isPlaying) {
                        this.bgm.play();
                    }
                });

                this.time.delayedCall(3000, () => {
                    this.scene.restart();
                });
            }
        },
        loop: true
    });
}

function update () {
    if (isGameFrozen || !this.jet.active) return;

    background.tilePositionY -= 1;

    this.jet.setVelocityX(0);
    if (cursors.left.isDown) {
        this.jet.setVelocityX(-400);
    } else if (cursors.right.isDown) {
        this.jet.setVelocityX(400);
    }

    if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
        let bullet = bullets.create(this.jet.x, this.jet.y - 40, 'bullet');
        bullet.setVelocityY(-600);
        bullet.setScale(0.5);
        bullet.body.allowGravity = false;

        this.sound.play("gun", { volume: 0.5 });
    }

    this.jet.y = 800;
}
