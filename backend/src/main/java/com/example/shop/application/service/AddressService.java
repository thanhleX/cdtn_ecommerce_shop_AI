package com.example.shop.application.service;

import com.example.shop.application.dto.request.AddressRequest;
import com.example.shop.application.dto.response.AddressResponse;
import com.example.shop.application.mapper.AddressMapper;
import com.example.shop.domain.entity.Address;
import com.example.shop.domain.entity.User;
import com.example.shop.domain.exception.AppException;
import com.example.shop.domain.exception.ErrorCode;
import com.example.shop.domain.repository.AddressRepository;
import com.example.shop.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final AddressMapper addressMapper;

    @Transactional(readOnly = true)
    public List<AddressResponse> getUserAddresses(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        // Requires findByUser method in AddressRepository
        List<Address> addresses = addressRepository.findByUser(user);
        return addressMapper.toAddressResponseList(addresses);
    }

    @Transactional
    public AddressResponse createAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (addressRepository.countByUser(user) >= 3) {
            throw new AppException(ErrorCode.ADDRESS_LIMIT_EXCEEDED);
        }

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearDefaultAddress(user);
        }

        Address address = addressMapper.toAddress(request);
        address.setUser(user);

        // If it's the first address, make it default automatically
        if (addressRepository.countByUser(user) == 0) {
            address.setIsDefault(true);
        }

        Address savedAddress = addressRepository.save(address);
        return addressMapper.toAddressResponse(savedAddress);
    }

    @Transactional
    public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request) {
        Address address = getAddressAndVerifyOwner(userId, addressId);

        if (Boolean.TRUE.equals(request.getIsDefault()) && !Boolean.TRUE.equals(address.getIsDefault())) {
            clearDefaultAddress(address.getUser());
        }

        addressMapper.updateAddress(address, request);
        return addressMapper.toAddressResponse(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = getAddressAndVerifyOwner(userId, addressId);
        addressRepository.delete(address);
    }

    private void clearDefaultAddress(User user) {
        List<Address> addresses = addressRepository.findByUser(user);
        for (Address addr : addresses) {
            if (Boolean.TRUE.equals(addr.getIsDefault())) {
                addr.setIsDefault(false);
                addressRepository.save(addr);
            }
        }
    }

    private Address getAddressAndVerifyOwner(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));
        if (!address.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        return address;
    }
}
