from django.test import TestCase
from django.core.exceptions import ValidationError
from .models import ITModel
from contextlib import contextmanager
from django.core.exceptions import NON_FIELD_ERRORS, ValidationError


# helper method from https://goodcode.io/articles/django-assert-raises-validationerror/
# not in use
class ValidationErrorTestMixin(object):

    @contextmanager
    def assert_validation_errors(self, fields):
        """
        Assert that a validation error is raised, containing all the specified
        fields, and only the specified fields.
        """
        try:
            yield
            raise AssertionError("ValidationError not raised")
        except ValidationError as e:
            self.assertEqual(set(fields), set(e.message_dict.keys()))


# Create your tests here.

class ITModelTest(TestCase):

    # Test cases for the ITModel display_color param
    def test_ITModel_display_color(self):
        display_color_test1 = ITModel(
            vendor="Test Vendor",
            model_number="TestModelNum",
            height=1,
            display_color="",  # Should throw error
        )

        display_color_test2 = ITModel(
            vendor="Test Vendor",
            model_number="TestModelNum",
            height=1,
            display_color="#AAA",  # Should NOT throw error
        )

        display_color_test2.full_clean()  # Should NOT throw error

        with self.assertRaises(ValidationError):
            display_color_test1.full_clean()  # Should throw error

    # Test cases for the ITModel ethernet_ports param
    def test_ITModel_ethernet_ports(self):
        ethernet_ports_test1 = ITModel(
            vendor="Test Vendor",
            model_number="TestModelNum",
            height=1,
            display_color="#AAA",
            ethernet_ports=-1  # Should throw error
        )

        ethernet_ports_test2 = ITModel(
            vendor="Test Vendor",
            model_number="TestModelNum",
            height=1,
            display_color="#AAA",
            ethernet_ports=1  # Should NOT throw error
        )

        ethernet_ports_test2.full_clean()  # Should NOT throw error

        with self.assertRaises(ValidationError):
            ethernet_ports_test1.full_clean()  # Should throw error


"""
class ModelTest(ValidationErrorTestMixin, TestCase):

    def test_display_color(self):
        c = ITModel(
            vendor="Dell",
            model_number=1,
            height=1,
            display_color=0,  # this should cause the test to fail
            ethernet_ports=1,
            power_ports=1,
            cpu="abc",
            memory=1,
            storage="abc",
            comment="abc"
        )

        with self.assertValidationErrors(['display_color']):
            c.full_clean()
"""
