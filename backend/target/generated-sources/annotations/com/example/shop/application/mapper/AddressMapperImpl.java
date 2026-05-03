package com.example.shop.application.mapper;

import com.example.shop.application.dto.request.AddressRequest;
import com.example.shop.application.dto.response.AddressResponse;
import com.example.shop.domain.entity.Address;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-03T22:16:23+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Oracle Corporation)"
)
@Component
public class AddressMapperImpl implements AddressMapper {

    @Override
    public Address toAddress(AddressRequest request) {
        if ( request == null ) {
            return null;
        }

        Address.AddressBuilder address = Address.builder();

        address.fullAddress( request.getFullAddress() );
        address.phone( request.getPhone() );
        address.receiverName( request.getReceiverName() );
        address.isDefault( request.getIsDefault() );

        return address.build();
    }

    @Override
    public AddressResponse toAddressResponse(Address address) {
        if ( address == null ) {
            return null;
        }

        AddressResponse.AddressResponseBuilder addressResponse = AddressResponse.builder();

        addressResponse.id( address.getId() );
        addressResponse.fullAddress( address.getFullAddress() );
        addressResponse.phone( address.getPhone() );
        addressResponse.receiverName( address.getReceiverName() );
        addressResponse.isDefault( address.getIsDefault() );

        return addressResponse.build();
    }

    @Override
    public List<AddressResponse> toAddressResponseList(List<Address> addresses) {
        if ( addresses == null ) {
            return null;
        }

        List<AddressResponse> list = new ArrayList<AddressResponse>( addresses.size() );
        for ( Address address : addresses ) {
            list.add( toAddressResponse( address ) );
        }

        return list;
    }

    @Override
    public void updateAddress(Address address, AddressRequest request) {
        if ( request == null ) {
            return;
        }

        address.setFullAddress( request.getFullAddress() );
        address.setPhone( request.getPhone() );
        address.setReceiverName( request.getReceiverName() );
        address.setIsDefault( request.getIsDefault() );
    }
}
