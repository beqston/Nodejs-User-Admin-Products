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

function editUser(index){
    document.getElementById('edit-user').style.display = 'block';
}

function closeEdit() {
  document.querySelectorAll('.close-edit').forEach((item) => {
    item.addEventListener('click', () => {
      const editContainer = item.closest('.edit-user');
      if (editContainer) {
        editContainer.style.display = 'none';
      }
    });
  });
}
document.addEventListener('DOMContentLoaded', closeEdit);
