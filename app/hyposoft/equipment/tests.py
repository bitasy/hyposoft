from django.test import TestCase
from django.core.exceptions import ValidationError
from .models import ITModel, Rack, Instance
from contextlib import contextmanager
from django.core.exceptions import NON_FIELD_ERRORS, ValidationError

"""Used in class InstanceTest(TestCase)"""
example_itmodel=ITModel(vendor="Test Vendor",
                model_number="TestModelNum",
                height=1)
example_rack=Rack(row="A",
                  number=1)

class ITModelTest(TestCase):
    """
    Test cases for the ITModel param, display_color
    Reqs: optional; 6-digit, 3-byte hex triplet (RGB) preceded by a pound sign
    (#); case insensitive; e.g. #7FFFD4, #7fffd4
    """
    def test_ITModel_display_color(self):
        display_color_test1 = ITModel(
            vendor="Test Vendor",
            model_number="TestModelNum",
            height=1,
            display_color="#AAA"  # Should NOT throw error
        )
        display_color_test1.full_clean()  # Should NOT throw error

        display_color_test2 = ITModel(
            vendor="Test Vendor",
            model_number="TestModelNum",
            height=1,
            display_color="#AAAA"  # Should throw error
        )
        with self.assertRaises(ValidationError):
            display_color_test2.full_clean()  # Should throw error

        display_color_test3 = ITModel(
            vendor="Test Vendor",
            model_number="TestModelNum",
            height=1,
            display_color="AAA"  # Should throw error
        )
        with self.assertRaises(ValidationError):
            display_color_test3.full_clean()  # Should throw error

        display_color_test4 = ITModel(
            vendor="Test Vendor",
            model_number="TestModelNum",
            height=1,
            display_color="#!!!"  # Should throw error
        )
        with self.assertRaises(ValidationError):
            display_color_test4.full_clean()  # Should throw error

    """
    Test cases for the ITModel param, ethernet_ports
    Reqs: optional, non-negative
    """
    def test_ITModel_ethernet_ports(self):
        ethernet_ports_test1 = ITModel(
            vendor="Test Vendor",
            model_number="TestModelNum",
            height=1,
            ethernet_ports=1  # Should NOT throw error
        )
        ethernet_ports_test1.full_clean()  # Should NOT throw error

        ethernet_ports_test2 = ITModel(
            vendor="Test Vendor",
            model_number="TestModelNum",
            height=1,
            ethernet_ports=-1  # Should throw error
        )
        with self.assertRaises(ValidationError):
            ethernet_ports_test2.full_clean()  # Should throw error

    """
    Test cases for the ITModel param, power_ports
    Reqs: optional, non-negative
    """
    def test_ITModel_power_ports(self):
        power_ports_test1 = ITModel(
            vendor="Test Vendor",
            model_number="TestModelNum",
            height=1,
            power_ports=1  # Should NOT throw error
        )
        power_ports_test1.full_clean()  # Should NOT throw error

        power_ports_test2 = ITModel(
            vendor="Test Vendor",
            model_number="TestModelNum",
            height=1,
            power_ports=-1  # Should throw error
        )
        with self.assertRaises(ValidationError):
            power_ports_test2.full_clean()  # Should throw error

    """
    Test cases for the ITModel param, memory
    Reqs: optional, non-negative
    """
    def test_ITModel_memory(self):
        memory_test1 = ITModel(
            vendor="Test Vendor",
            model_number="TestModelNum",
            height=1,
            memory=16  # Should NOT throw error
        )
        memory_test1.full_clean()  # Should NOT throw error

        memory_test2 = ITModel(
            vendor="Test Vendor",
            model_number="TestModelNum",
            height=1,
            memory=-1  # Should throw error
        )
        with self.assertRaises(ValidationError):
            memory_test2.full_clean()  # Should throw error


class RackTest(TestCase):
    """
    Test cases for the Rack params, row number
    Reqs: required always; string; the address of a rack is by a row letter (A-Z) and
    rack number (positive integer); there is no separator between the row letter and rack number
    """
    def test_Rack_row(self):
        row_test1 = Rack(
            row="A",  # Should NOT throw error
            number=1
        )
        row_test1.full_clean()  # Should NOT throw error

        row_test2 = Rack(
            row="AA",  # Should NOT throw error
            number="1"
        )
        row_test2.full_clean()  # Should NOT throw error

        row_test3 = Rack(
            row="A A",  # Should throw error
            number=1
        )
        with self.assertRaises(ValidationError):
            row_test3.full_clean()  # Should throw error

        row_test4 = Rack(
            row=1,  # Should throw error
            number=1
        )
        with self.assertRaises(ValidationError):
            row_test4.full_clean()  # Should throw error

    def test_Rack_number(self):
        number_test1 = Rack(
            row="A",
            number=1  # Should NOT throw error
        )
        number_test1.full_clean()  # Should NOT throw error

        number_test2 = Rack(
            row="A",
            number=-1  # Should throw error
        )
        with self.assertRaises(ValidationError):
            number_test2.full_clean()  # Should throw error

        number_test3 = Rack(
            row="A",
            number="A"  # Should throw error
        )
        with self.assertRaises(ValidationError):
            number_test3.full_clean()  # Should throw error


class InstanceTest(TestCase):

    # Test cases for the Instance param, hostname
    # Reqs:  required always; RFC-1034-compliant string

    def test_Instance_hostname(self):
        hostname_test1 = Instance(
            itmodel=ITModel(vendor="Test Vendor",
                            model_number="TestModelNum",
                            height=1),
            hostname="test",  # Should NOT throw error
            rack=Rack(row="A",
                      number=1),
            rack_u=1
        )
        hostname_test1.full_clean()  # Should NOT throw error

        hostname_test2 = Instance(
            itmodel=example_itmodel,
            hostname="test",  # Should NOT throw error
            rack=example_rack,
            rack_u=1
        )
        with self.assertRaises(ValidationError):
            hostname_test2.full_clean()  # Should throw error


    # Test cases for the Instance param, rack_u
    # Reqs: required always; positive integer; refers to the vertical location
    # (on a rack, measured in U) of the bottom of the equipment
    
    def test_Instance_rack_u(self):
        rack_u_test1 = Instance(
            itmodel=example_itmodel,
            hostname="test",
            rack=example_rack,
            rack_u=1  # Should NOT throw error
        )
        rack_u_test1.full_clean()  # Should NOT throw error

        rack_u_test2 = Instance(
            itmodel=ITModel(vendor="Test Vendor",
                            model_number="TestModelNum",
                            height=1),
            hostname="test",
            rack=Rack(row="A",
                      number=1),
            rack_u=-1  # Should throw error
        )
        with self.assertRaises(ValidationError):
            rack_u_test2.full_clean()  # Should throw error



