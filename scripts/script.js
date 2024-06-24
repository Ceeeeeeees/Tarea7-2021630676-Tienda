import config from '../config.js';

document.addEventListener('DOMContentLoaded', () => {
    
    const menuCaptura = document.getElementById('menu-captura');
    const menuCompra = document.getElementById('menu-compra');
    const seccionCaptura = document.getElementById('captura');
    const seccionCompra = document.getElementById('compra');
    const seccionCarrito = document.getElementById('carrito');
    const formCaptura = document.getElementById('form-captura');
    const inputBuscar = document.getElementById('buscar');
    const resultados = document.getElementById('resultados');
    const verCarrito = document.getElementById('ver-carrito');
    const listaCarrito = document.getElementById('lista-carrito');
    const totalCompra = document.getElementById('total-compra');
    const eliminarCarrito = document.getElementById('eliminar-carrito');
    const seguirComprando = document.getElementById('seguir-comprando');
    // script.js
    

    let articulos = [];
    let carrito = [];

    menuCaptura.addEventListener('click', () => {
        seccionCaptura.classList.remove('hidden');
        seccionCompra.classList.add('hidden');
        seccionCarrito.classList.add('hidden');
    });

    menuCompra.addEventListener('click', () => {
        seccionCaptura.classList.add('hidden');
        seccionCompra.classList.remove('hidden');
        seccionCarrito.classList.add('hidden');
    });

    formCaptura.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value;
        const descripcion = document.getElementById('descripcion').value;
        const precio = parseFloat(document.getElementById('precio').value);
        const cantidad = parseInt(document.getElementById('cantidad').value);
        const foto = document.getElementById('foto').files[0];
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const articulo = {
                nombre,
                descripcion,
                precio,
                cantidad,
                foto: event.target.result.split(',')[1]
            };
            fetch('https://t7-2021630676-vs-a.azurewebsites.net/api/alta_articulo', { //Aqui va la ip de la azure function
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' ,
                    'x-functions-key': config.azureFunctionKey //Aqui va la key de la azure function es la de Default
                },
                body: JSON.stringify({ articulo })
            })
            .then(response => response.json())
            .then(data => {
                if (data.mensaje) {
                    alert(data.mensaje);
                } else {
                    alert('Artículo guardado exitosamente');
                }
                formCaptura.reset();
            })
            .catch(error => console.error('Error:', error));
        };
        reader.readAsDataURL(foto);
    });

    inputBuscar.addEventListener('input', () => {
        const query = inputBuscar.value.toLowerCase();
        fetch('https://t7-2021630676-vs-a.azurewebsites.net/api/buscar_articulos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' ,
                'x-functions-key': config.azureFunctionKey //Aqui va la key de la azure function es la de Default
            },
            body: JSON.stringify({ keyword: query })
        })
        .then(response => response.json())
        .then(data => {
            resultados.innerHTML = '';
    
            // Asume que `data` es el arreglo de artículos directamente
            const articulos = data;
    
            // Verificar la estructura de los datos
            console.log(articulos);
    
            if (articulos && Array.isArray(articulos)) {
                articulos.forEach(articulo => {
                    const div = document.createElement('div');
                    div.innerHTML = `
                        <h3>${articulo.nombre}</h3>
                        <p>${articulo.descripcion}</p>
                        <p>Precio: $${articulo.precio.toFixed(2)}</p>
                        <p>Disponibles: ${articulo.cantidad}</p>
                        <img src="data:image/png;base64,${articulo.foto}" alt="${articulo.nombre}" style="max-width: 100px;">
                        <input type="number" min="1" value="1" id="cantidad-${articulo.id_articulo}">
                        <button onclick="agregarAlCarrito(${articulo.id_articulo})">Compra</button>
                    `;
                    resultados.appendChild(div);
                });
            } else {
                console.error('La respuesta del backend no contiene un arreglo de artículos válido');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });    

    verCarrito.addEventListener('click', () => {
        mostrarCarrito();
        seccionCaptura.classList.add('hidden');
        seccionCompra.classList.add('hidden');
        seccionCarrito.classList.remove('hidden');
    });

    eliminarCarrito.addEventListener('click', () => {
        fetch('https://t7-2021630676-vs-a.azurewebsites.net/api/eliminar_todos_carrito', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            alert(data.mensaje);
            mostrarCarrito();
        })
        .catch(error => console.error('Error:', error));
    });

    seguirComprando.addEventListener('click', () => {
        seccionCaptura.classList.add('hidden');
        seccionCompra.classList.remove('hidden');
        seccionCarrito.classList.add('hidden');
    });

    window.agregarAlCarrito = function(id_articulo) {
        const cantidadInput = document.getElementById(`cantidad-${id_articulo}`);
        const cantidad = parseInt(cantidadInput.value);
        if (cantidad > 0) {
            fetch('https://t7-2021630676-vs-a.azurewebsites.net/api/comprar_articulo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' ,
                    'x-functions-key': config.azureFunctionKey //Aqui va la key de la azure function es la de Default
                },
                body: JSON.stringify({ id_articulo, cantidad })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.mensaje); });
                }
                return response.json();
            })
            .then(data => {
                alert(data.mensaje);
            })
            .catch(error => {
                console.error('Error:', error);
                alert(`Error: ${error.message}`);
            });
        } else {
            alert('Cantidad no válida');
        }
    };
    

    window.eliminarDelCarrito = function(id_articulo) {
        fetch('https://t7-2021630676-vs-a.azurewebsites.net/api/eliminar_articulo_carrito', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' ,
                'x-functions-key': config.azureFunctionKey //Aqui va la key de la azure function es la de Default
            },
            body: JSON.stringify({ id_articulo })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.mensaje);
            mostrarCarrito();
        })
        .catch(error => console.error('Error:', error));
    };

    function mostrarCarrito() {
        listaCarrito.innerHTML = '';
        let total = 0;
        fetch('https://t7-2021630676-vs-a.azurewebsites.net/api/obtener_carrito', {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {

            const articulos = data;

            articulos.forEach(item => {
                const costo = item.precio * item.cantidad;
                total += costo;
                const div = document.createElement('div');
                div.innerHTML = `
                    <img src="data:image/png;base64,${item.foto}" alt="${item.nombre}" style="max-width: 50px;">
                    <p>${item.nombre}</p>
                    <p>${item.descripcion}</p>
                    <p>Cantidad: ${item.cantidad}</p>
                    <p>Precio: $${item.precio.toFixed(2)}</p>
                    <p>Costo: $${costo.toFixed(2)}</p>
                    <button onclick="eliminarDelCarrito('${item.id_articulo}')">Eliminar artículo</button>
                `;
                listaCarrito.appendChild(div);
            });
            totalCompra.textContent = total.toFixed(2);
        })
        .catch(error => console.error('Error:', error));
    }
});
