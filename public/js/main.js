const wrapperProduct = document.getElementById('wrapper-section"');
const succsessMessage = document.getElementById('succses-message');

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
        const errorMessage = document.getElementById('error');
        errorMessage.style.display ='block'
        errorMessage.style.textAlign ='center'
        errorMessage.textContent = `${error.message}`
        console.error('Error in editUser:', error);
        alert(error.message || 'An error occurred while updating the user');
    }
}

async function deleteUser(id, event) {
    event.preventDefault();
    document.querySelectorAll('.wrapper').forEach((item)=>{
        item.addEventListener('click', ()=>{
            item.style.display = 'none';
        })
    })
    try {
        const res = await fetch(`/admin/user/${id}/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to delete user.');
        }
    } catch (err) {
        console.error('Delete failed:', err.message);
        // Optional: Show error to user (e.g. alert or toast)
    }
}

async function deleteUserImage(id, event){
    event.preventDefault();

    try {
        const res = await fetch(`/admin/user/delete/image/`+id, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if(!res.ok){
            const error = res.json().catch(()=>({}));
            throw new Error(error.message || 'Failed to delete user photo.')
        }
        window.location.href = '/admin/user/'+id+'/edit'; 
    } catch (err) {
        console.error('Delete failed:', err.message);
        // Optional: Show error to user (e.g. alert or toast)
    }
}

async function updateProduct(id, event){
    event.preventDefault();
        
    try {
        const form = document.getElementById('update-product-form');

        if (!form) {
            console.error('Edit form not found');
            return;
        };

        const formData = new FormData(form);

        const res = await fetch(`/admin/product/${id}/edit`, {
            method: 'PATCH',
            body: formData
        });

        if(!res.ok){
            const error = await res.json().catch(()=>({}));
            throw new Error(error.message || `Failed to update user: ${res.statusText}`)
        }

    } catch (err) {
        console.log('error:'+err.message)
    }
}

function showSuccsessMessage(){
    succsessMessage.style.display ='flex'
    setTimeout(()=>{
        succsessMessage.style.display ='none'
    }, 4000)
}



async function deleteProduct(id, event) {
    event.preventDefault();
    document.querySelectorAll('.product-wrap').forEach((item) => {
        item.addEventListener('click', () => {
            item.style.display = 'none';
        });
    });
    try {
        const res = await fetch(`/admin/product/${id}/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to delete product.');
        }

    } catch (err) {
        console.error('Delete failed:', err.message);
    }
}

