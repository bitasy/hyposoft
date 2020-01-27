from django.test import TestCase
from django.core.exceptions import ValidationError
from .models import ITModel

# Create your tests here.
class ITModelTest(TestCase):
    """
    def test_ITModel_create_display_color(self):
        with self.assertRaises(ValidationError): # Validators don't get called on model save - see link in slack
            ITModel.objects.create(
                vendor="Test Vendor",
                model_number="TestModelNum",
                height=1,
                display_color="",  # Should throw error
            )
    """
