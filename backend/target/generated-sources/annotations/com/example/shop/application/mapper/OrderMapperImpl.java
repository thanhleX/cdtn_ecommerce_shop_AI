package com.example.shop.application.mapper;

import com.example.shop.application.dto.response.OrderItemResponse;
import com.example.shop.application.dto.response.OrderResponse;
import com.example.shop.application.dto.response.PaymentMethodResponse;
import com.example.shop.domain.entity.Order;
import com.example.shop.domain.entity.OrderItem;
import com.example.shop.domain.entity.PaymentMethod;
import com.example.shop.domain.entity.Product;
import com.example.shop.domain.entity.ProductImage;
import com.example.shop.domain.entity.ProductVariant;
import com.example.shop.domain.entity.User;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T00:11:08+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Oracle Corporation)"
)
@Component
public class OrderMapperImpl implements OrderMapper {

    @Autowired
    private AddressMapper addressMapper;

    @Override
    public OrderResponse toOrderResponse(Order order, List<OrderItemResponse> items) {
        if ( order == null && items == null ) {
            return null;
        }

        OrderResponse.OrderResponseBuilder orderResponse = OrderResponse.builder();

        if ( order != null ) {
            orderResponse.userId( orderUserId( order ) );
            orderResponse.customerName( orderUserFullName( order ) );
            orderResponse.customerEmail( orderUserEmail( order ) );
            orderResponse.paymentMethodId( orderPaymentMethodId( order ) );
            orderResponse.paymentMethodName( orderPaymentMethodName( order ) );
            orderResponse.shippingAddress( addressMapper.toAddressResponse( order.getAddress() ) );
            orderResponse.id( order.getId() );
            orderResponse.orderDate( order.getOrderDate() );
            if ( order.getStatus() != null ) {
                orderResponse.status( order.getStatus().name() );
            }
            orderResponse.note( order.getNote() );
            orderResponse.totalAmount( order.getTotalAmount() );
            orderResponse.discountAmount( order.getDiscountAmount() );
            orderResponse.finalAmount( order.getFinalAmount() );
        }
        List<OrderItemResponse> list = items;
        if ( list != null ) {
            orderResponse.items( new ArrayList<OrderItemResponse>( list ) );
        }

        return orderResponse.build();
    }

    @Override
    public OrderItemResponse toOrderItemResponse(OrderItem orderItem) {
        if ( orderItem == null ) {
            return null;
        }

        OrderItemResponse.OrderItemResponseBuilder orderItemResponse = OrderItemResponse.builder();

        orderItemResponse.productVariantId( orderItemProductVariantId( orderItem ) );
        orderItemResponse.sku( orderItemProductVariantSku( orderItem ) );
        orderItemResponse.imageUrl( orderMapImageUrl( orderItemProductVariantProductImages( orderItem ) ) );
        orderItemResponse.id( orderItem.getId() );
        orderItemResponse.productName( orderItem.getProductName() );
        orderItemResponse.variantAttributes( orderItem.getVariantAttributes() );
        orderItemResponse.price( orderItem.getPrice() );
        orderItemResponse.quantity( orderItem.getQuantity() );
        orderItemResponse.totalAmount( orderItem.getTotalAmount() );

        return orderItemResponse.build();
    }

    @Override
    public PaymentMethodResponse toPaymentMethodResponse(PaymentMethod paymentMethod) {
        if ( paymentMethod == null ) {
            return null;
        }

        PaymentMethodResponse.PaymentMethodResponseBuilder paymentMethodResponse = PaymentMethodResponse.builder();

        paymentMethodResponse.id( paymentMethod.getId() );
        paymentMethodResponse.name( paymentMethod.getName() );
        paymentMethodResponse.description( paymentMethod.getDescription() );
        paymentMethodResponse.image( paymentMethod.getImage() );

        return paymentMethodResponse.build();
    }

    private Long orderUserId(Order order) {
        if ( order == null ) {
            return null;
        }
        User user = order.getUser();
        if ( user == null ) {
            return null;
        }
        Long id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String orderUserFullName(Order order) {
        if ( order == null ) {
            return null;
        }
        User user = order.getUser();
        if ( user == null ) {
            return null;
        }
        String fullName = user.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }

    private String orderUserEmail(Order order) {
        if ( order == null ) {
            return null;
        }
        User user = order.getUser();
        if ( user == null ) {
            return null;
        }
        String email = user.getEmail();
        if ( email == null ) {
            return null;
        }
        return email;
    }

    private Long orderPaymentMethodId(Order order) {
        if ( order == null ) {
            return null;
        }
        PaymentMethod paymentMethod = order.getPaymentMethod();
        if ( paymentMethod == null ) {
            return null;
        }
        Long id = paymentMethod.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String orderPaymentMethodName(Order order) {
        if ( order == null ) {
            return null;
        }
        PaymentMethod paymentMethod = order.getPaymentMethod();
        if ( paymentMethod == null ) {
            return null;
        }
        String name = paymentMethod.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    private Long orderItemProductVariantId(OrderItem orderItem) {
        if ( orderItem == null ) {
            return null;
        }
        ProductVariant productVariant = orderItem.getProductVariant();
        if ( productVariant == null ) {
            return null;
        }
        Long id = productVariant.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String orderItemProductVariantSku(OrderItem orderItem) {
        if ( orderItem == null ) {
            return null;
        }
        ProductVariant productVariant = orderItem.getProductVariant();
        if ( productVariant == null ) {
            return null;
        }
        String sku = productVariant.getSku();
        if ( sku == null ) {
            return null;
        }
        return sku;
    }

    private List<ProductImage> orderItemProductVariantProductImages(OrderItem orderItem) {
        if ( orderItem == null ) {
            return null;
        }
        ProductVariant productVariant = orderItem.getProductVariant();
        if ( productVariant == null ) {
            return null;
        }
        Product product = productVariant.getProduct();
        if ( product == null ) {
            return null;
        }
        List<ProductImage> images = product.getImages();
        if ( images == null ) {
            return null;
        }
        return images;
    }
}
