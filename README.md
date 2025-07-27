A responsive, full-screen Pong game built with HTML, CSS, and JavaScript.  
The player controls the left paddle with the mouse, while the right paddle is controlled by a simple AI.  
Includes real-time scoring, top 3 high scores, pause/resume (button or spacebar), a game manual, and a restart button.  
The game fits any screen size and supports a custom background image for a visually engaging experience.

---

## Features

- **Responsive Full-Screen Gameplay:**  
  The game canvas automatically scales to fit any device or screen size without scrollbars.
- **Mouse Paddle Control:**  
  Move your mouse up and down to control the left paddle.
- **Simple AI Opponent:**  
  The right paddle is controlled by an AI that tracks the ball.
- **Bouncing Ball:**  
  Ball speed increases with each bounce for an escalating challenge.
- **Collision Detection:**  
  Accurate wall and paddle collision.
- **Real-Time Score:**  
  Player and AI scores displayed at the top.
- **Top 3 High Scores:**  
  High scores are stored in your browser using `localStorage`.
- **Pause and Restart:**  
  Pause/resume with the button or spacebar. Instantly restart the game and scores.
- **Manual/Instructions:**  
  Pop-up manual explains controls and gameplay.
- **Custom Background:**  
  Easily set a background image for a personalized aesthetic.
- **Footer Credit:**  
  Discreet credit at the bottom: _by Tushxrb_.

---

## Controls

- **Move Paddle**: Move your mouse up/down on the left side of the game area.
- **Pause/Unpause**: Click the **Pause** button or press the **Spacebar**.
- **Restart**: Click the **Restart** button.
- **Manual/Instructions**: Click the **Manual** button.

---

## Customizing Background

To set your own background image, edit `styles.css`:

```css
body {
    background: #101016 url('your-image.jpg') no-repeat center center fixed !important;
    background-size: cover;
    /* ... */
}
```
Replace `'your-image.jpg'` with your desired image filename or URL.

---

## Running the Game

1. **Download or clone this repository.**
2. **Open `index.html` in your browser.**  
   No installation or server needed—everything runs in your browser!

---

## File Structure

```
index.html       # Main game interface
styles.css       # Styles and layout
game.js          # Game logic and interactivity
README.md        # This file
```

---

## Credits

- Game and code by [Tushxrb](https://github.com/Tushxrb).
- Inspired by the classic PONG game.

---

Enjoy playing!
