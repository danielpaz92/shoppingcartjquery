// EXEC FUNCTIONS
$(document).ready(function() {
    
    // EXEC SHOW PRODUCTS FUNCTION
    showProducts();

    // HIDE LOADING
    $('#loading').hide();

    // CALL CALC SHIPPING FUNCTION
    $( "#btn-calc-frete" ).click(function() {
      calcShipping();
      event.preventDefault();
    });

    // HIDE CEP ERROR
    $('.cep-error').hide();
    
    // HIDE DEFAULT DIV FOR SUCCESS MESSAGES
    $('#success-message').hide();

    $( "#filterProducts").submit(function( event ) {
      filterProductsByBrand();
      event.preventDefault();
    });

});


function getTotal()
{
  var sumVal = 0;
  var value = 0;
  $('#cart .subtotalprow').each(function()
  {
    value = $(this).html();
    sumVal = sumVal + parseInt(value);
  });
  //console.log(sumVal);
  var shipping = $('.shipping-price').html();
  var total = 0;
  if($('.shipping-price').is(':empty'))
  {
    $("#sub-total-products").html(sumVal);
    $(".total-price").html(sumVal);
  }
  else
  {
    $("#sub-total-products").html(sumVal);
    total = sumVal + parseInt(shipping);
    $(".total-price").html(total);
  }

}

// FUNCTION TO CALC SHIPPING BASED ON SHIPPING COST TABLE AND VIACEP API
function calcShipping(){
        $('#loading').show();

        // GET VALUE TYPED IN CEP FIELD
        var cep = document.getElementById('cep').value;

        // INIT VAR COSTS
        var costs = [];

        // GET LIST OF SHIPPING COST PER ESTATE FROM JSON FILE
        $.getJSON('http://vistomarketing.com.br/cart/js/frete.json', function (json){
          for (var key in json) {
              if(json.hasOwnProperty(key)) {
                  var item = json[key];
                  costs.push({
                      uf: item.UF,
                      valor: item.valor,
                  });            
              }
          }
    });

        // CONSULT ON VIACEP TO GET ESTATE
        $.ajax({
            url: "https://viacep.com.br/ws/"+cep+"/json/ ",
            type: "get",
            dataType: "JSON",
            success: function(result, success){
              estado = result['uf'];
              erro = result['erro'];
              if(erro == true)
              {
                 $('.cep-error').show();
              }
              else
              {
                $('.cep-error').hide();
                for(var i=0; i<costs.length; i++) {
                  if(costs[i]['uf'] == estado)
                  {
                    var element = $(".shipping-price");
                    
                          $(".shipping-price").html(costs[i]['valor']);  
                                  
                  }
                }
              }
              getTotal();
              $('#loading').hide();
            }
        });
}

// FUNCTION TO SHOW PRODUCTS FROM JSON FILE
function showProducts(){
      $('#loading').show();    
      $.ajax({        
        url: "http://vistomarketing.com.br/cart/js/products.json",        
        type: "GET",        
        dataType: "JSON",
        headers: {
            'Content-Type':'application/json'
      },
        async: false,   
        success: data => {            
          //console.log(data);
          var product = '';
          for(f in data){
            var preco = data[f]['preco'];
            var id = data[f]['id'];
            var imagem = data[f]['imagem'];
            var nome = data[f]['nome'];
            var descricao = data[f]['descricao'];
            var fabricante = data[f]['fabricante'];
            var card = '<div class="col-lg-4 col-md-6 mb-4">'+
                       '<div class="card h-100 product-'+id+'">'+
                       '<a href="#"><img class="card-img-top" src="'+imagem+'" alt="'+nome+'"></a>'+
                       '<div class="card-body">'+
                       '<h4 class="card-title"><a href="#">'+nome+'</a></h4>'+
                       '<h5>R$<span class="price">'+preco+'</span> à vista</h5>'+
                       '<small>ou em <strong>10x sem juros</strong> de R$'+(preco/10)+'</small>'+
                       '<hr>'+
                       '<p class="card-text">'+descricao+'</p>'+
                       '<small>Fabricante:<span class="brand">'+fabricante+'</span></small>'+
                       '</div>'+
                       '<div class="card-footer">'+
                       '<a onclick="addToCart('+id+')" class="calc-shipping btn btn-primary btn-md waves-effect waves-light">Adicionar ao carrinho<a/>'+
                       '</div>'+
                       '</div>'+
                       '</div>';
            product += card;
          }
            $('#products').html(product);
            $('#loading').hide();        
        }
      }); 
}

// FUNCTION TO FILTER PRODUCTS BASED ON THEIR BRANDS
function filterProductsByBrand()
{ 
      $('#loading').show();
      var brands = [];

      $("input:checkbox[name=brand]:checked").each(function(){
          brands.push($(this).val());
      });

      $.ajax({        
        url: "http://vistomarketing.com.br/cart/js/products.json",        
        type: "GET",        
        dataType: "JSON",
        headers: {
            'Content-Type':'application/json'
      },
        async: false,   
        success: data => {            
          //console.log(data);
          var product = '';

          for(f in data){
            for (b in brands){

            var fabricante = data[f]['fabricante'];
                if(fabricante == brands[b]){
            var card =     '<div class="col-lg-4 col-md-6 mb-4">'+
                           '<div class="card h-100">'+
                           '<a href="#"><img class="card-img-top" src="'+data[f]['imagem']+'" alt="'+data[f]['nome']+'"></a>'+
                           '<div class="card-body">'+
                           '<h4 class="card-title"><a href="#">'+data[f]['nome']+'</a></h4>'+
                           '<h5>R$<span class="price">'+data[f]['preco']+'</span> à vista</h5>'+
                           '<small>ou em <strong>10x sem juros</strong> de R$'+(data[f]['preco']/10)+'</small>'+
                           '<hr>'+
                           '<p class="card-text">'+data[f]['descricao']+'</p>'+
                           '<small>Fabricante:<span class="brand">'+data[f]['fabricante']+'</span></small>'+
                           '</div>'+
                           '<div class="card-footer">'+
                           '<button type="button" class="btn btn-sm btn-primary pull-right">Adicionar ao carrinho</button>'+
                           '</div>'+
                           '</div>'+
                           '</div>';
              product += card;
          }
          $('#products').html(product);
          }     
        } 
        $('#loading').hide();   
      } 
  }); 
}

function removeProduct(id)
{
    $('#loading').show();
    var qt = $('.product-'+id+' .qt-product-'+id+'').val();
    if(qt == 1)
    {
        document.getElementById('product-'+id+'').remove();
    }
    qt--;
    $('.product-'+id+' .qt-product-'+id+'').val(qt);
    this.updatePrice(id);
    $('#loading').hide();
}

function updatePrice(id)
{
    $('#loading').show();
    var qt = $('.product-'+id+' .qt-product-'+id+'').val();
    var preco = $('.product-'+id+' .product-price').text();
    $('.subtotal-product-'+id+'').html(qt*preco);
    $('#loading').hide();
    getTotal();
}

// SHOPPING CART
function addToCart(id)
{
      $('#loading').show();
      var order = [];
      $.ajax({        
        url: "http://vistomarketing.com.br/cart/js/products.json",        
        type: "GET",        
        dataType: "JSON",
        headers: {
            'Content-Type':'application/json'
      },
        async: false,
        success: data => {            
          //console.log(data);
          var product = '';

          for(f in data){
            var productid = data[f]['id'];
            if(productid == id)
            {
              var nome = data[f]['nome'];
              var imagem = data[f]['imagem'];
              var fabricante = data[f]['fabricante'];
              var preco = data[f]['preco'];
              var qt = 1;
              
              var card = '<tr class="product-'+id+'" id="product-'+id+'"><td>'+
                         '<img class="card-img-top" src="'+imagem+'" alt="'+nome+'">'+
                         '</td>'+
                         '<td data-th="Produto">'+
                         '<h3>'+nome+'</h3>'+
                         '<small>'+fabricante+'</small>'+
                         '</td>'+
                         '<td data-th="Preço">R$<span class="product-price">'+preco+'</span></td>'+
                         '<td data-th="Quantidade">'+
                         '<input type="number" onchange="updatePrice('+id+')" class="form-control text-center qt-product-'+id+'" id="quantity" value="'+qt+'">'+
                         '</td>'+
                         '<td data-th="Subtotal">R$<span class="subtotalprow subtotal-product-'+id+'">'+qt*preco+'</span></td>'+
                         '<td class="actions" data-th="">'+
                         '<a onclick="updatePrice('+id+')" class="btn btn-info btn-sm waves-effect waves-light"><i class="fa fa-refresh"></i></a>'+
                         '<a onclick="removeProduct('+id+')" class="btn btn-danger btn-sm waves-effect waves-light"><i class="fa fa-trash-o"></i></a>'+
                         '</td>'+
                         '</tr>';

              if (document.getElementById('product-'+id+'') == null)
              {            
                  $(".product-items").append(card);
                  getTotal();
              }
              else
              {
                 qt++;
                 $('.qt-product-'+id+'').val(qt);
                 $('.subtotal-product-'+id+'').html(qt*preco);
                 getTotal();
              }
              // SHOW SUCCESS MESSAGE
              $('#success-message .message').html(
                  'Produto '+nome+
                  ' adicionado ao carrinho com sucesso! '+
                  '<strong><a class="" data-toggle="modal" data-target="#my-cart">'+
                  ' Clique aqui para ver o carrinho </strong>'+
                  '</a>');
              $('#success-message').show();
              order.push(data[f]);
              //console.log(order);
            }         
          }
          $('#loading').hide();    
      } 
      });
}