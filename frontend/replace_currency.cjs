const fs = require('fs');
const path = require('path');

function replaceCurrency(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceCurrency(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = content;
            
            // Replace >$ with >LKR 
            updated = updated.replace(/>\$/g, '>LKR ');
            
            // Dashboard.jsx
            updated = updated.replace(/`\$\$\{stats\.totalRevenue\}`/g, '`LKR ${stats.totalRevenue}`');
            
            // Orders.jsx
            updated = updated.replace(/\$\{item\.unit_price\} ×/g, 'LKR ${item.unit_price} ×');
            
            // Cart.jsx
            updated = updated.replace(/ \$\{\(item\.price \* item\.quantity\)\.toFixed\(2\)\}/g, ' LKR ${(item.price * item.quantity).toFixed(2)}');
            
            // Generic fallback for any other standalone $ symbols before variables like ${
            // Only if preceded by space or newline or tab.
            updated = updated.replace(/ \$\{/g, ' LKR ${');
            
            // Actually Cart.jsx line 148 has `                  ${(item.price * item.quantity).toFixed(2)}`
            // and line 171 `                <span>${totalPrice.toFixed(2)}</span>` (handled by >$)
            
            if (content !== updated) {
                fs.writeFileSync(fullPath, updated, 'utf8');
                console.log('Updated', fullPath);
            }
        }
    }
}
replaceCurrency('./src');
