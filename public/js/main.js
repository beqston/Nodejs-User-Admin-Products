async function deleteProductFromCart(productId) {
    document.querySelectorAll('.center').forEach((item) => {
        item.addEventListener('click', () => {
            item.style.display = 'none';
        });
    });
        alert("Product removed from cart!");
    try {
        const response = await fetch(`http://localhost:4000/cart/${productId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to delete product: ${response.statusText}`);
        }

    } catch (error) {
        console.error("Error deleting product:", error.message);
    }
}

async function editUser(id, event) {
    event.preventDefault(); // Prevent default form submission
    
    try {
        const form = document.getElementById('edit-user-form');
        if (!form) {
            console.error('Edit form not found');
            return;
        }

        const formData = new FormData(form);
        
        // Only include password fields if they're not empty
        if (!formData.get('password')) {
            formData.delete('password');
            formData.delete('confirmPassword');
        }

        const response = await fetch(`/admin/user/${id}/edit`, {
            method: "PATCH",
            body: formData  // Let the browser set the correct Content-Type with boundary
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Failed to update user: ${response.statusText}`);
        }
        window.location.href = "/admin/users";
    } catch (error) {
        console.error('Error in editUser:', error);
        alert(error.message || 'An error occurred while updating the user');
    }
}


