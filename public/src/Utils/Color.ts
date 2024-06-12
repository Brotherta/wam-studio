


/**
 * Gets a random color in string format.
 * @return {string} - The random color.
 * @private
 */
export function getRandomColor(): string {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}