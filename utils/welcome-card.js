
const { createCanvas, loadImage } = require('@napi-rs/canvas');

async function createWelcomeCard(member) {
    const width = 1000;
    const height = 350;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#111827');
    gradient.addColorStop(0.55, '#312e81');
    gradient.addColorStop(1, '#6d28d9');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative circles
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#ffffff';

    ctx.beginPath();
    ctx.arc(900, 40, 150, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(80, 330, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;

    // Decorative accent line
    ctx.fillStyle = '#a78bfa';
    ctx.fillRect(70, 55, 75, 5);

    // Welcome heading
    ctx.fillStyle = '#c4b5fd';
    ctx.font = 'bold 25px sans-serif';
    ctx.fillText('NEW MEMBER', 70, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 58px sans-serif';
    ctx.fillText('WELCOME!', 70, 165);

    // Member username
    let username = member.user.username;
    if (username.length > 20) {
        username = username.slice(0, 19) + '…';
    }

    ctx.fillStyle = '#e9d5ff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(username, 70, 220);

    // Server name
    let serverName = member.guild.name;
    if (serverName.length > 30) {
        serverName = serverName.slice(0, 27) + '…';
    }

    ctx.fillStyle = '#ddd6fe';
    ctx.font = '22px sans-serif';
    ctx.fillText(`Welcome to ${serverName}`, 70, 270);

    // Member count
    ctx.fillStyle = '#c4b5fd';
    ctx.font = '18px sans-serif';
    ctx.fillText(
        `MEMBER #${member.guild.memberCount}`,
        70,
        310
    );

    // Load member avatar
    const avatarURL = member.displayAvatarURL({
        extension: 'png',
        size: 256
    });

    const avatar = await loadImage(avatarURL);

    // Circular avatar on the right
    const avatarX = 760;
    const avatarY = 85;
    const avatarSize = 170;

    ctx.save();

    ctx.beginPath();
    ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2 + 7,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = '#a78bfa';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
    );
    ctx.clip();

    ctx.drawImage(
        avatar,
        avatarX,
        avatarY,
        avatarSize,
        avatarSize
    );

    ctx.restore();

    // Return PNG image buffer
    return canvas.toBuffer('image/png');
}

module.exports = createWelcomeCard;
